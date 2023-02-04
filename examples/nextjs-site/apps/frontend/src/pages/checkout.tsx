import { startOrder } from "@/api";
import Layout from "@/layout";
import { Box, Button } from "@mui/material";
import { useCallback } from "react";

export default function Home() {
  const start = useCallback(() => {
    startOrder({
      userId: "sam",
      address: "somewhere",
      items: [],
      store: "there",
    }).then(({ orderId }) => {
      window.location.href = "/track?orderId=" + orderId;
    });
  }, []);

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
