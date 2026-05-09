export default function ({ redirect, app, route }) {
  if (app.$config.maintenance && route.path !== "/maintenance") {
    return redirect("/maintenance");
  } else if (!app.$config.maintenance && route.path === "/maintenance") {
    return redirect("/");
  }
}
