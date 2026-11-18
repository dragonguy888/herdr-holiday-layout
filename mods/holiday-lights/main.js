import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { agents, theme, shared, setShared } from "herdr";

// A string of fairy lights under the tab bar. Eight colours, each bulb with a
// soft glow, twinkling natively (.loop on opacity, each with its own period,
// so they drift out of step); no timer redraws the window. When an agent is
// blocked the colours stay but every bulb blinks fast and in step. Click the
// string to switch the lights off/on.
const COLORS = ["#ff4d5e", "#ff9f1c", "#ffd23f", "#4cd964", "#2ee6d6", "#4da3ff", "#a970ff", "#ff6fd8"];
const SPACING = 24;           // px between bulbs
const KEY = "holiday.lights"; // shared: false = lights off
const WIRE = "#3d5c4a";

export default class HolidayLights extends View {
  init() {
    this.width = 900;
  }

  render() {
    const t = theme();
    const on = shared(KEY) !== false;
    const alarm = agents().some(a => a.status === "blocked");
    const count = Math.max(4, Math.floor(this.width / SPACING));
    const bulbs = [];
    for (let i = 0; i < count; i++) {
      // Step by 3 through the 8 colours so neighbours never sit in rainbow order.
      const color = COLORS[(i * 3) % COLORS.length];
      const drop = [1, 3, 5, 3][i % 4]; // the string sags like a garland
      const glow = div().id(`bulb-${i}`).w(13).h(15).rounded(7).flex().items_center().justify_center()
        .bg(on ? color + "40" : "#00000000")
        .child(div().w(7).h(10).rounded(4).bg(on ? color : t.raised))
        .when(on, el => el.loop("opacity", alarm
          ? { from: 0.2, to: 1, period: 520 }
          : { from: 0.35, to: 1, period: 1100 + (i * 337) % 1500 }));
      bulbs.push(div().flex().flex_col().items_center().mt(drop)
        .child(div().w(2).h(3).bg(WIRE))
        .child(glow));
    }
    return h_flex().id("lights").size_full().relative().px(10).justify_between().items_start()
      .cursor_pointer().tooltip(on ? "Click to switch the lights off" : "Click to switch the lights on")
      .on_size_change((size, cx) => {
        if (Math.abs(size.width - this.width) > SPACING / 2) { this.width = size.width; cx.notify(); }
      })
      .on_click(() => setShared(KEY, !on))
      // The wire the bulbs hang from.
      .child(div().absolute().top(2).left(0).right(0).h(1).bg(WIRE))
      .children(bulbs);
  }
}
