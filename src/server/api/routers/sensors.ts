import { z } from "zod";

import { DeviceModel } from "~/zod/types";

import {
  systemProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const sensorRouter = createTRPCRouter({
  getLight: publicProcedure.query(async ({ ctx }) => {
    const light = await ctx.db.lightConsumption.findMany({});
    return light;
  }),
  addLight: systemProcedure
    .input(z.object({ lightAfter: z.string(), sesion: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        input.sesion
          ? await ctx.db.lightConsumption.create({
              data: {
                lightAfter: input.lightAfter,
                sesion: {
                  connect: {
                    id_sesion: input.sesion,
                  },
                },
              },
            })
          : await ctx.db.lightConsumption.create({
              data: {
                lightAfter: input.lightAfter,
                sesion: {},
              },
            });
        return true;
      } catch (error) {
        console.log("error: ", error);
        return false;
      }
    }),
  getTemperature: publicProcedure.query(async ({ ctx }) => {
    const temperatures = await ctx.db.temperature.findMany({});

    return temperatures;
  }),

  addTemperature: systemProcedure
    .input(z.object({ data: z.number(), sesion: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        input.sesion
          ? await ctx.db.temperature.create({
              data: {
                temp_registered: input.data,
                sesion: {
                  connect: {
                    id_sesion: input.sesion,
                  },
                },
              },
            })
          : await ctx.db.temperature.create({
              data: {
                temp_registered: input.data,
              },
            });

        return true;
      } catch (error) {
        console.log("error: ", error);
        return false;
      }
    }),

  getRFIDLectures: publicProcedure.query(async ({ ctx }) => {
    const lectures = await ctx.db.rFID.findMany({});

    return lectures;
  }),
  addRFIDLecture: systemProcedure
    .input(z.object({ data: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.rFID.upsert({
          where: {
            id_RFID: input.data,
          },
          update: {
            detections: {
              increment: 1,
            },
          },
          create: {
            id_RFID: input.data,
          },
        });
        return true;
      } catch (error) {
        console.log("error: ", error);
        return false;
      }
    }),

  registerMovement: systemProcedure.mutation(async ({ ctx }) => {
    // Id and timestamp of movement autogenerated
    await ctx.db.movement.create({
      data: {},
    });
  }),
  getMovement: publicProcedure.query(async ({ ctx }) => {
    // Id and timestamp of movement autogenerated
    return await ctx.db.movement.findMany({});
  }),

  addWorkTime: systemProcedure
    .input(z.object({ data: z.number(), sesion: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        input.sesion
          ? await ctx.db.workingTime.create({
              data: {
                workTime: input.data,
                sesion: {
                  connect: {
                    id_sesion: input.sesion,
                  },
                },
              },
            })
          : await ctx.db.workingTime.create({
              data: {
                workTime: input.data,
              },
            });
        return true;
      } catch (error) {
        console.log("error: ", error);
        return false;
      }
    }),

  getWorkingTime: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.workingTime.findMany({});
  }),
});
