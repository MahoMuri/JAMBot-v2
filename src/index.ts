import { config } from "dotenv";
import { Bot } from "./client";

config();

new Bot().init();
