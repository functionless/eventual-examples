import Layout from "@/layout";
import { useService } from "@/use-service";
import useUser from "@/use-user";
import { useInterval } from "@/utils";
import { Order, OrderStatus } from "@food-ordering/core";
import Check from "@mui/icons-material/Check";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import DoneAll from "@mui/icons-material/DoneAll";
import Group from "@mui/icons-material/Group";
import LocalPizza from "@mui/icons-material/LocalPizza";
import Phone from "@mui/icons-material/Phone";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { Grid, Stack } from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

export default function Track() {
  const router = useRouter();
  const { orderId } = router.query;

  const [pollDelay, setPollDelay] = useState<null | number>(1000);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const { session } = useUser({ redirectTo: "/login" });
  const service = useService(session);
  const get = useCallback(async () => {
    if (session && orderId && typeof orderId === "string") {
      setOrder(await service.getOrder(orderId));
    }
  }, [orderId, session, service]);

  useInterval(get, pollDelay);

  useEffect(() => {
    if (order && order.status === "DELIVERED") {
      setPollDelay(null);
    }
  }, [order]);

  return (
    <Layout>
      <div>
        {order ? (
          <Grid container>
            <Grid item xs={4}>
              <Steps orderStatus={order.status} />
            </Grid>
            <Grid item xs={8}>
              <div style={{ paddingTop: 30 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    Store: {order.store}
                  </Grid>
                  <Grid item xs={12}>
                    Created At: {new Date(order.timestamp).toLocaleString()}
                  </Grid>
                  <Grid item xs={12}>
                    Destination: {order.address}
                  </Grid>
                  <Grid item xs={12}>
                    Items:
                    <Stack>
                      {order.items.map((i) => (
                        <div key={i.name}>
                          {i.name} x {i.quantity}
                        </div>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        ) : undefined}
      </div>
    </Layout>
  );
}

const steps: {
  status: OrderStatus | OrderStatus[];
  text: string;
  icon?: React.ReactElement;
}[] = [
  {
    status: ["CREATED", "PENDING"],
    text: "Contacting Restaurant",
    icon: <Phone />,
  },
  {
    status: "ACCEPTED",
    text: "Restaurant Accepted Your Order",
    icon: <Check />,
  },
  { status: "PREPARING", text: "Preparing Your Order", icon: <Group /> },
  {
    status: "READY_FOR_PICKUP",
    text: "Waiting for Your Driver",
    icon: <LocalPizza />,
  },
  { status: "IN_ROUTE", text: "On Its Way", icon: <DirectionsCar /> },
  { status: "DELIVERED", text: "Delivered!", icon: <DoneAll /> },
];

function Steps(props: { orderStatus: OrderStatus }) {
  const stepIndex = steps.findIndex(({ status }) =>
    typeof status === "string"
      ? status === props.orderStatus
      : status.includes(props.orderStatus)
  );
  return (
    <Timeline
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {steps.map((s, i) => {
        const past = i < stepIndex;
        const current = i === stepIndex;
        const color = past ? "grey" : current ? "green" : undefined;
        return (
          <TimelineItem key={s.text}>
            <TimelineSeparator>
              {i !== 0 ? (
                <TimelineConnector
                  sx={{
                    backgroundColor: current ? "grey" : color,
                  }}
                />
              ) : undefined}
              <TimelineDot
                sx={{
                  backgroundColor: color,
                }}
              >
                {s.icon ? s.icon : undefined}
              </TimelineDot>
              {i < steps.length - 1 ? (
                <TimelineConnector
                  sx={{
                    backgroundColor: current ? undefined : color,
                  }}
                />
              ) : undefined}
            </TimelineSeparator>
            <TimelineContent
              sx={{ marginTop: "auto", marginBottom: "auto", color }}
            >
              {s.text}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
