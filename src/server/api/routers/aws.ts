import { z } from "zod";

import { DeviceModel } from "~/zod/types";

import {
  systemProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

export const AWSRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(z.object({ connectionId: z.string(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const device = await ctx.db.device.findUnique({
          where: {
            connectionId: input.connectionId,
          },
        });

        if (!device) {
          return "Error: device not found";
        }

        const callbackUrl = `https://${device.domain}/${device.stage}`;

        const client = new ApiGatewayManagementApiClient({
          endpoint: callbackUrl,
          region: "us-east-1",
        });

        const requestParams = {
          ConnectionId: device.connectionId,
          Data: JSON.stringify({
            action: "message",
            content: input.message,
          }),
        };

        const command = new PostToConnectionCommand(requestParams);

        const result = await client.send(command);
        return JSON.stringify(result);
      } catch (error) {
        console.log("error: ", error);
      }

      return false;
    }),
});