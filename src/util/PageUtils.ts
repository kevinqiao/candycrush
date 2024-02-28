import { AppsConfiguration, Covers } from "model/PageConfiguration";
import { PageItem } from "model/PageProps";

export const parseURL = (location: any): { navItem?: PageItem; ctx?: string; stackItems?: PageItem[] } => {
    const res: any = {};
    const navItem: any = {};
    const ps = location.pathname.split("/");
    res["ctx"] = ps[1].length === 0 ? "/" : ps[1];

    let app: any = AppsConfiguration.find((a) => a.context === res['ctx']);
    if (!app) {
        app = AppsConfiguration.find((a) => a.context === "/" || a.context === "");
    }

    if (app) {
        const uri = location.pathname.substring(res['ctx'].length + 1);
        const navCfg: any = uri.length === 0 ? app.navs[0] : app.navs.find((nav: any) => uri.includes(nav.uri));

        if (navCfg) {
            navItem["ctx"] = app.context;
            navItem.name = navCfg.name;
            res.navItem = navItem;
            const pos = uri.lastIndexOf(navCfg.uri) + navCfg.uri.length;
            const sub = uri.substring(pos + 1);
            if (navCfg.children && sub) {
                const child = navCfg.children.find((c: any) => c.uri === sub);
                if (child) navItem.child = child.name;
            }

            const params: { [key: string]: string } = {};
            if (location.search) {
                const searchParams = new URLSearchParams(location.search);
                for (const param of searchParams) {
                    params[param[0]] = param[1];
                }
                navItem.data = params;
                navItem.params = params
            }
            if (location.hash) {
                if (location.hash.includes("@")) {
                    const stackItems = [];
                    const hs = location.hash.split("@");
                    navItem.anchor = hs[0];
                    for (let i = 1; i < hs.length; i++) {
                        const stackCfg = app.stacks?.find((s: any) => s.name === hs[i]);
                        if (stackCfg) {
                            stackItems.push({ name: stackCfg.name, ctx: app.context, data: params });
                        } else {
                            const cover = Covers.find((c) => c.name === hs[i]);
                            if (cover) stackItems.push({ name: cover.name });
                        }
                    }
                    res.stackItems = stackItems;
                } else navItem.anchor = location.hash;
            }
        }

    }

    return res;
};
export const buildNavURL = (pageItem: PageItem): string | null => {
    const app = AppsConfiguration.find((a) => a.context === pageItem.ctx);
    if (app) {
        let url = "/" + app.context;
        const nav = app.navs.find((nav) => nav.name === pageItem.name);
        if (nav) {
            url = url + nav.uri;
            if (pageItem.child) {
                const child = nav.children.find((c) => c.name === pageItem.child);
                if (child) url = url + child.uri;
            }
        }
        return url;
    }
    return null;
};
export const buildStackURL = (pageItem: PageItem): string | null => {
    let uri = window.location.search ? window.location.href + "&" : window.location.href;
    if (pageItem.params) {
        uri = uri + "?"
        Object.keys(pageItem.params).forEach((k, index) => {
            const v = pageItem.params[k];
            if (Object.keys(pageItem.params).length === index + 1) {
                uri = uri + k + "=" + v;
            } else uri = uri + k + "=" + v + "&";
        });
    }

    if (pageItem.ctx) {
        const app: any = AppsConfiguration.find((a) => a.context === pageItem.ctx);
        if (app?.stacks) {
            const stack = app.stacks.find((s) => s.name === pageItem.name);
            if (stack) return uri + "#@" + pageItem.name;
        }
    } else {
        const cover = Covers.find((c) => c.name === pageItem.name);
        if (cover) return uri + "#@" + pageItem.name;
    }
    return null;
};
export const getCurrentAppConfig = () => {
    const ps = location.pathname.split("/");
    const app: any = AppsConfiguration.find((a) => a.context === ps[1]);
    return app;
}
export const getUriByPop = (stacks: PageItem[], pop: string): string => {
    let url = window.location.pathname;
    if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const toPop = stacks.find((s) => s.name === pop)
        if (toPop?.params)
            Object.keys(toPop.params).forEach((k) => {
                if (searchParams.has(k)) searchParams.delete(k);
            });

        if (Object.keys(searchParams).length > 0) url = url + "?" + searchParams.toString();
    }
    const hash = window.location.hash;
    if (hash) {
        const hs: string[] = hash.split("@");
        const nhash = hs.filter((h) => h !== pop).join("@");
        url = url + (nhash !== "#" ? nhash : "");
    }
    return url
}