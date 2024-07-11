import m from "mithril";

class LayoutComponent {
    view(vnode) {
        const { page, options } = vnode.attrs;
        return m(".container-fluid.h-100", [
            m(page, {
                ...options,
            }),
        ]);
    }
}

export default function (page, options = {}) {
    return {
        render: () => {
            return m(LayoutComponent, {
                page,
                ...options,
            });
        },
    };
}
