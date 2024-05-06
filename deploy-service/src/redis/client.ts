import {createClient} from "redis";
import "dotenv/config";
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 19765,
  },
});

client.connect();
export default client;
