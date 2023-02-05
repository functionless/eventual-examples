import { useContext, useEffect, useState } from "react";
import { Order } from "@nextjs-site/core";
import Layout from "@/layout";
import { getOrders } from "@/api";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { Grid } from "@mui/material";
import { UserContext } from "@/user-context";
import Link from "next/link";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#1A2027",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: "white",
}));

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (user) {
      getOrders(user.getUsername()).then((orders) => setOrders(orders));
    }
  }, [user]);

  return (
    <Layout mode="authed">
      <div>
        <Stack spacing={1}>
          {orders.map((o) => (
            <Link href={`/track?orderId=${o.id}`} key={o.id}>
              <Item>
                <Grid container>
                  <Grid item xs={10}>
                    <div>{new Date(o.timestamp).toLocaleString()}</div>
                  </Grid>
                  <Grid item xs={2}>
                    <div>{o.status}</div>
                  </Grid>
                </Grid>
              </Item>
            </Link>
          ))}
        </Stack>
      </div>
    </Layout>
  );
}
