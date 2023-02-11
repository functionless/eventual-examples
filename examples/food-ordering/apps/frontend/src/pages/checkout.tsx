import { foodOrderingService, } from "@/food-ordering-client";
import Layout from "@/layout";
import useUser from "@/use-user";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback } from "react";

export default function Home() {
  const router = useRouter();
  const { session } = useUser({ redirectTo: "/login" });
  const start = useCallback(() => {
    if (session) {

      foodOrderingService.createOrder(
        {
          address: "somewhere",
          items: [],
          store: "there",
          userId: "",
        },
        {
          headers: {
            Authorization: `Basic ${session.getAccessToken().getJwtToken()}`,
          },
        }
      ).then(({ id }) => {
        router.push("/track?orderId=" + id);
      })

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
