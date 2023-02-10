import {
  event,
  api,
  ApiResponse,
  workflow,
  activity,
  signal,
  asyncResult,
} from "@eventual/core";

// import a shared definition of the helloEvent
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

declare const sns: SNSClient;
declare const ses: SNSClient;

/**
 * Choreography vs Orchestration
 *
 * https://theburningmonk.com/2020/08/choreography-vs-orchestration-in-the-land-of-serverless/
 */

interface Order {
  userId: string;
  items: string[];
  storeId: string;
  orderId: string;
}

const orderPlacedEvent = event<Order>("order_placed");
const restaurantNotifiedEvent = event<{ orderId: string }>(
  "restaurant_notified"
);
const orderAcceptedEvent = event<{ orderId: string }>("order_accepted");
const userNotifiedEvent = event<{ orderId: string }>("user_notified");
const orderCompletedEvent = event<{ orderId: string }>("order_completed");
const orderCancelledEvent = event<{ orderId: string }>("order_cancelled");

/**
 * Choreography
 *
 * Using events to talk between services and bounded contexts.
 */

// 1. create order
api.post("/orders", async (req) => {
  const { userId, items, storeId } = await req.json();
  const orderId = "randomString";
  await orderPlacedEvent.publishEvents({ userId, items, storeId, orderId });
  return new ApiResponse(undefined, { status: 200 });
});

// 2. notify restaurant
orderPlacedEvent.onEvent(async (started) => {
  await sns.send(new PublishCommand({ Message: JSON.stringify(started) }));
  await restaurantNotifiedEvent.publishEvents({ orderId: started.orderId });
});

// 3. restaurant accepts order
api.post("/orders/:orderId/accept", async (req) => {
  const { orderId } = req.params ?? {};
  await orderAcceptedEvent.publishEvents({ orderId });
  return new ApiResponse(undefined, { status: 200 });
});

// 4. notify the customer
orderAcceptedEvent.onEvent(async (accepted) => {
  // get the order from the table by order id
  const order = {} as { orderId: string; userId: string };
  const customer = {} as { email: string };
  await ses.send(
    new SendEmailCommand({
      Destination: { ToAddresses: [customer.email] },
      Message: {
        Subject: { Data: "Order!" + accepted.orderId },
        Body: { Text: { Data: "IS COMING" } },
      },
      Source: "me",
    })
  );
  await userNotifiedEvent.publishEvents({ orderId: order.orderId });
});

// 5. driver completes the order
api.post("/orders/:orderId/complete", async (req) => {
  const { orderId } = req.params ?? {};
  await orderCompletedEvent.publishEvents({ orderId });
  return new ApiResponse(undefined, { status: 200 });
});

/**
 * Orchestration
 *
 * Using a workflow to orchestrate the core, long running business logic.
 * A single execution represents a single order, the order id is used as the execution name.
 */

// 1. Create Order
api.post("/v2/orders", async (req) => {
  const { userId, items, storeId } = await req.json();
  const orderId = "randomString";
  await orderWorkflow.startExecution({
    input: { items, orderId, storeId, userId },
    executionName: orderId,
  });
  return new ApiResponse(undefined, { status: 200 });
});

api.post("/v2/orders/:orderId/accept", async (req) => {
  const { orderId } = req.params ?? {};
  await orderAcceptedSignal.sendSignal(
    `${orderWorkflow.workflowName}/${orderId}`,
    {
      accepted: true,
    }
  );
  return new ApiResponse(undefined, { status: 200 });
});

api.post("/v2/orders/:orderId/complete", async (req) => {
  const { orderId } = req.params ?? {};
  await orderDeliveredSignal.sendSignal(
    `${orderWorkflow.workflowName}/${orderId}`,
    {
      succeeded: true,
    }
  );
  return new ApiResponse(undefined, { status: 200 });
});

const orderAcceptedSignal = signal<{ accepted: boolean }>("order_accepted");
const orderDeliveredSignal = signal<{ succeeded: boolean }>("order_delivered");

const notifyRestaurant = activity("notifyRestaurant", async (order: Order) => {
  await sns.send(new PublishCommand({ Message: JSON.stringify(order) }));
});

const notifyCustomer = activity("notifyCustomer", async (order: Order) => {
  const customer = {} as { email: string };
  await ses.send(
    new SendEmailCommand({
      Destination: { ToAddresses: [customer.email] },
      Message: {
        Subject: { Data: "Order!" + order.orderId },
        Body: { Text: { Data: "IS COMING" } },
      },
      Source: "me",
    })
  );
});
const cancelOrder = activity("cancelOrder", async (orderId: string) => {
  // do something here.
});

const orderWorkflow = workflow("orderWorkflow", async (order: Order) => {
  // 2. new order! tell the restaurant.
  await notifyRestaurant(order);

  // 3. wait for the restaurant to call /v2/orders/:orderId/accept
  const accepted = await orderAcceptedSignal.expectSignal();
  if (!accepted) {
    return cancel();
  }

  // 4. after the restaurant accepts, tell the user and emit events for anyone who needs to know
  await notifyCustomer(order);

  // 5. wait for the restaurant to call /v2/orders/:orderId/complete
  const succeeded = await orderDeliveredSignal.expectSignal();
  if (!succeeded) {
    return cancel();
  }

  async function cancel() {
    await cancelOrder(order.orderId);
  }
});

/**
 * Orchestration and Choreography - Adding events back
 *
 * With the core workflow defined, we can add informational events
 * for other services to react. The core business logic is orchestrated, but
 * some decoupled services like the promotion service doesn't
 * impact the order flow.
 */
const orderWorkflowWithEvents = workflow(
  "orderWorkflowWithEvents",
  async (order: Order) => {
    // 2. new order! tell the restaurant.
    await Promise.all([
      notifyRestaurant(order),
      // send an event so other services can react to the new order.
      restaurantNotifiedEvent.publishEvents({ orderId: order.orderId }),
    ]);

    // 3. wait for the restaurant to call /v2/orders/:orderId/accept
    const accepted = await orderAcceptedSignal.expectSignal();
    if (!accepted) {
      return cancel();
    }

    // 4. after the restaurant accepts, tell the user and emit events for anyone who needs to know
    await Promise.all([
      orderAcceptedEvent.publishEvents({ orderId: order.orderId }),
      notifyCustomer(order),
      userNotifiedEvent.publishEvents({ orderId: order.orderId }),
    ]);

    // 5. wait for the restaurant to call /v2/orders/:orderId/complete
    const succeeded = await orderDeliveredSignal.expectSignal();
    if (!succeeded) {
      return cancel();
    }

    // 6. order was delivered! let the world know.
    await orderCompletedEvent.publishEvents({ orderId: order.orderId });

    async function cancel() {
      await Promise.all([
        cancelOrder(order.orderId),
        orderCancelledEvent.publishEvents({
          orderId: order.orderId,
        }),
      ]);
    }
  }
);

// in the proto-code service
orderCompletedEvent.onEvent(async ({ orderId }) => {
  const customer = {} as { email: string };
  await ses.send(
    new SendEmailCommand({
      Destination: { ToAddresses: [customer.email] },
      Message: {
        Subject: { Data: "Offer!" },
        Body: {
          Text: {
            Data: "Thanks for you last order, here is an offer for more!",
          },
        },
      },
      Source: "promo team",
    })
  );
});

/**
 * Orchestration with Activities
 *
 * This example shows how a synchronous action like waiting for
 * a restaurant to accept can be modeled as a long running activity
 * instead of using signals.
 */

const askRestaurant = activity("askRestaurant", (order: Order) => {
  return asyncResult<{ accepted: boolean }>(async (token) => {
    await sns.send(
      new PublishCommand({ Message: JSON.stringify({ order, token }) })
    );
  });
});

api.post("/v3/orders/accept", async (req) => {
  const { token } = (await req.json()) ?? {};
  await askRestaurant.sendActivitySuccess({
    activityToken: token,
    result: { accepted: true },
  });
  return new ApiResponse(undefined, { status: 200 });
});

const orderWorkflowWithActivities = workflow(
  "orderWorkflowWithEvents",
  async (order: Order) => {
    // 2 and 3. new order! tell the restaurant.
    const [{ accepted }] = await Promise.all([
      // wait for the restaurant to call /v3/orders/accept
      askRestaurant(order),
      // send an event so other services can react to the new order.
      restaurantNotifiedEvent.publishEvents({ orderId: order.orderId }),
    ]);

    if (!accepted) {
      return cancel();
    }

    // 4. after the restaurant accepts, tell the user and emit events for anyone who needs to know
    await Promise.all([
      orderAcceptedEvent.publishEvents({ orderId: order.orderId }),
      notifyCustomer(order),
      userNotifiedEvent.publishEvents({ orderId: order.orderId }),
    ]);

    // 5. wait for the restaurant to call /v2/orders/:orderId/complete
    const succeeded = await orderDeliveredSignal.expectSignal();
    if (!succeeded) {
      return cancel();
    }

    // 6. order was delivered! let the world know.
    await orderCompletedEvent.publishEvents({ orderId: order.orderId });

    async function cancel() {
      await Promise.all([
        cancelOrder(order.orderId),
        orderCancelledEvent.publishEvents({
          orderId: order.orderId,
        }),
      ]);
    }
  }
);
