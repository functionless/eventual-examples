import { startOrder } from "@/api";
import Layout from "@/layout";
import useUser from "@/use-user";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";

export default function Home() {
  const router = useRouter();
  const { session } = useUser({ redirectTo: "/login" });
  const start = useCallback(() => {
    if (session) {
      startOrder(
        {
          address: "somewhere",
          items: [],
          store: "there",
        },
        session.getAccessToken().getJwtToken()
      ).then(({ orderId }) => {
        router.push("/track?orderId=" + orderId);
      });
    }
  }, [session, router]);

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
