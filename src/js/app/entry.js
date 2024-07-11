import routes from "@base/routes";
import m from "mithril";

function render() {
    m.route(document.body, "/", routes);
}

document.addEventListener("DOMContentLoaded", (event) => {
    render();
});
