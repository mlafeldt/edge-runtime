import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

console.log('main function started');

serve(async (req: Request) => {
  const url = new URL(req.url);
  const {pathname} = url;
  const path_parts = pathname.split("/");
  const service_name = path_parts[1];

  if (!service_name || service_name === "") {
    const error = { msg: "missing function name in request" }
    return new Response(
        JSON.stringify(error),
        { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const servicePath = `./examples/${service_name}`;
  console.error(`serving the request with ${servicePath}`);

  const memoryLimitMb = 150;
  const workerTimeoutMs = 1 * 60 * 1000;
  const noModuleCache = false;
  const importMapPath = null;
  const envVarsObj = Deno.env.toObject();
  const envVars = Object.keys(envVarsObj).map(k => [k, envVarsObj[k]]);
  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb,
      workerTimeoutMs,
      noModuleCache,
      importMapPath,
      envVars
    });
    return worker.fetch(req);
  } catch (e) {
    console.error(e);
    const error = { msg: e.toString() }
    return new Response(
        JSON.stringify(error),
        { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
