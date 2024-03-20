import { Bindings } from ".";
import { getTaskAll, saveTask } from "../client";
import { addData, save } from "./task";

export const scheduled: ExportedHandlerScheduledHandler<Bindings> =
  async (_event, env, _ctx) => {
    const { GET_DATA_INTERVAL = 5, SAVE_ACCOUNT_INTERVAL = 10 } = env
    const tasks = await getTaskAll(env)
    await Promise.all(tasks.map(async ({ name, triggered_at }) => {
      try {
        const interval = Math.round((Date.now() - Date.parse(triggered_at)) / 1000 / 60)
        console.log(`Task ${name} interval: ${interval} min(s)`)
        let ok
        switch (name) {
          default:
            console.error(`Unknown task: ${name}`)
            return
          case 'add-data':
            console.log(`GET_DATA_INTERVAL: ${GET_DATA_INTERVAL}`)
            if (interval < GET_DATA_INTERVAL) {
              console.warn(`Task ${name} suspend`)
              return
            }
            ok = await addData(env)
            break
          case "save-account":
            console.log(`SAVE_ACCOUNT_INTERVAL: ${SAVE_ACCOUNT_INTERVAL}`)
            if (interval < SAVE_ACCOUNT_INTERVAL) {
              console.warn(`Task ${name} suspend`)
              return
            }
            ok = await save(env)
            break
        }
        await saveTask(env, name)
        console.log(`Task ${name} proceed: ${ok}`)
      } catch (e) {
        console.error(`Task ${name} panic: ${e}`)
      }
    }))
  }
