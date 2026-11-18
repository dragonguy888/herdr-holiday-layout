import { View, div, image, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { theme, run, props, window, shared, setShared, updates, layout } from "herdr";

// Holiday HQ sign (top of the sidebar) and the sidebar footer (props.footer).
// Icons and art live in this folder so the layout travels as one piece.
const DIR = "mods/holiday-brand";
const GOLD = "#f5c451";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// The rail goes by the sidebar's width, as in the shipped workspace-chrome.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

function toggleSidebar() {
  const width = find(layout(), "sidebar")?.size?.px;
  if (!narrow()) setShared("sidebar.width", width);
  setShared("sidebar.collapsed", !narrow());
  run("layout.resize", { id: "sidebar", px: narrow() ? (shared("sidebar.width") ?? 268) : window()?.platform === "macos" ? 76 : 44 });
}

export default class HolidayBrand extends View {
  button(id, label, action, tip) {
    const t = theme();
    return div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(6).text_color(t.muted)
      .hover(s => s.bg(t.hover).text_color(GOLD)).tooltip(tip)
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(action).child(label);
  }

  footer(t, collapsed) {
    const row = (id, icon, label, dim, action) => h_flex().id(id).h(28).px(8).gap(9).items_center().rounded(8)
      .when(collapsed, el => el.relative().w(32).px(0).justify_center().tooltip(label))
      .text_color(dim ? t.dim : t.muted).hover(s => s.bg(t.hover).text_color(t.foreground)).cursor_pointer()
      .on_click(action).child(svg(`${DIR}/${icon}.svg`).size(14))
      .when(!collapsed, el => el.child(label));
    const ready = div().size(6).rounded_full().bg(GOLD);
    return v_flex().size_full().bg(t.chrome).border_t(1).border_color(t.border).px(8).pt(4).pb(8).text_size(13)
      .when(collapsed, el => el.px(0).items_center())
      .child(row("settings", "settings", "Settings", false, () => run("app.settings"))
        .when(Boolean(updates().app.ready), el => el.child(collapsed ? ready.absolute().top(5).right(6) : ready)))
      .child(row("machine", "plus", "Add machine", true, () => run("mod.open", { name: "machine-add" })));
  }

  render() {
    const t = theme();
    const collapsed = narrow();
    if (props()?.footer) return this.footer(t, collapsed);
    const tree = image(`${DIR}/tree.png`).size(30).rounded(7).flex_none();
    const greeting = div().text_size(10).text_color(t.dim)
      .frames(["Merry Christmas", "Happy New Year", "Season's greetings", "Peace & joy"], 3500);
    return h_flex().size_full().bg(t.chrome).pl(collapsed ? 6 : 14).pr(10).gap(4).items_center().text_size(13.5)
      .when(window()?.platform === "macos" && !window()?.fullscreen && !collapsed, el => el.pl(76))
      .when(!collapsed, el => el.child(h_flex().flex_1().gap(9).items_center().child(tree)
        .child(v_flex().gap(0)
          .child(div().font_semibold().text_size(14).text_color(GOLD).child("Holiday HQ"))
          .child(greeting))))
      .when(!collapsed, el => el.child(this.button("search", svg(`${DIR}/search.svg`).size(15), () => run("mod.open", { name: "picker" }), "Find a space or tab")))
      .when(!(collapsed && window()?.platform === "macos"),
        el => el.child(this.button("sidebar-toggle", svg(`${DIR}/sidebar.svg`).size(15), toggleSidebar, "Fold the sidebar")));
  }
}
