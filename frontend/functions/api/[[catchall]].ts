import app from '../../src/server/index'

export const onRequest = (context: EventContext<unknown, any, Record<string, unknown>>) => {
  return app.fetch(context.request, context.env, context)
}
