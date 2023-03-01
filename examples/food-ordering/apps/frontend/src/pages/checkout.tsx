import Layout from "@/layout";
import { useService } from "@/use-service";
import useUser from "@/use-user";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback } from "react";

export default function Home() {
  const router = useRouter();
  const { session } = useUser({ redirectTo: "/login" });
  const service = useService(session);

  const start = useCallback(async () => {
    if (session) {
      const order = await service.createOrder({
        address: "somewhere",
        items: [],
        store: "there",
      });
      router.push("/track?orderId=" + order.id);
    }
  }, [session, service, router]);

  return (
    <Layout>
      TODO: Finish this page! Hit checkout to get a mystery order from a mystery
      restaurant...
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button onClick={start} variant="contained" size="large">
          Checkout!
        </Button>
      </Box>
    </Layout>
  );
}
