import { startOrder } from "@/api";
import Layout from "@/layout";
import { UserContext } from "@/user-context";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";

export default function Home() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const start = useCallback(() => {
    if (user) {
      startOrder({
        userId: user.getUsername(),
        address: "somewhere",
        items: [],
        store: "there",
      }).then(({ orderId }) => {
        router.push("/track?orderId=" + orderId);
      });
    }
  }, [user]);

  return (
    <Layout mode="authed">
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
