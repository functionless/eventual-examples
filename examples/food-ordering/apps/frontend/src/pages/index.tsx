import { useEffect, useState } from "react";
import { Order } from "@food-ordering/core";
import Layout from "@/layout";
import { foodOrderingService } from "@/food-ordering-client";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { Grid } from "@mui/material";
import Link from "next/link";
import useUser from "@/use-user";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#1A2027",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: "white",
}));

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { session } = useUser({ redirectTo: "/login" });
  useEffect(() => {
    if (session) {
      foodOrderingService.listOrders(undefined, {
        headers: {
          Authorization: `Basic ${session.getAccessToken().getJwtToken()}`,
        }
      }).then((orders) =>
        setOrders(orders)
      )
    }
  }, [session]);

  return (
    <Layout>
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
