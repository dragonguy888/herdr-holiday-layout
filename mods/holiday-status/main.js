import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, focused, agents, theme, run, window, keys, shared } from "herdr";

// Status bar: a Christmas / New Year countdown on the left, the space's
// machine and branch, festive agent counts (clickable), falling snow and the
// palette hint on the right.
const DIR = "mods/holiday-status";
const GOLD = "#f5c451";
const DAY = 86400000;

// What the countdown says today (local time).
export function countdown(now = new Date()) {
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  if (m === 11 && (d === 24 || d === 25)) return { icon: "🎄", text: "Merry Christmas!" };
  if (m === 0 && d <= 7) return { icon: "🎆", text: `Happy New Year ${y}!` };
  if (m === 11 && d > 25) {
    const ms = new Date(y + 1, 0, 1) - now;
    const left = ms < DAY ? `${Math.ceil(ms / 3600000)}h` : `${Math.ceil(ms / DAY)} days`;
    return { icon: "🎆", text: `${left} to ${y + 1}` };
  }
  const xmas = new Date(y, 11, 25);
  const days = Math.ceil((xmas - now) / DAY);
  return { icon: "🎄", text: `${days} ${days === 1 ? "day" : "days"} to Christmas` };
}

export default class HolidayStatus extends View {
  init(_props, cx) {
    // Data timer only: the countdown changes at most hourly.
    this.narrow = false;
    cx.timer.every(60000, (cx) => cx.notify());
  }

  hint() {
    const mac = window()?.platform === "macos";
    const mod = { cmd: mac ? "⌘" : "Ctrl+", ctrl: mac ? "⌃" : "Ctrl+", shift: mac ? "⇧" : "Shift+", alt: mac ? "⌥" : "Alt+", option: mac ? "⌥" : "Alt+" };
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    const parts = b && b.keys.endsWith("--") ? [...b.keys.slice(0, -2).split("-"), "-"] : b?.keys.split("-");
    const key = parts && parts.map((p) => mod[p.toLowerCase()] ?? p.toUpperCase()).join("");
    return key ? `${key}  commands` : "commands";
  }

  render() {
    const t = theme();
    const space = spaces().find(s => s.active);
    const tab = (space?.tabs ?? []).find(x => x.active) ?? space?.tabs?.[0];
    const lead = panes().find(p => p.tab === tab?.id && p.terminal) ?? focused();
    const branch = space?.branch || lead?.branch;
    const list = agents();
    const of = (s) => list.filter(a => a.status === s);
    const idle = list.length - of("working").length - of("blocked").length - of("done").length;
    const c = countdown();
    const label = (icon, text) => h_flex().gap(6).items_center().child(svg(`${DIR}/${icon}.svg`).size(13)).child(text);
    const pill = (id, emoji, color, text, target) => h_flex().id(id).gap(5).items_center().px(5).rounded(6)
      .text_color(color)
      .when(Boolean(target), el => el.cursor_pointer().hover(s => s.bg(t.hover))
        .tooltip("Go to it").on_click(() => run("agent.focus", { terminal: target.address })))
      .child(emoji).child(text);
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    // Left side shrinks and clips; the right side (snow, hint) always shows.
    const left = h_flex().flex_1().min_w(0).overflow_x_hidden().gap(12).items_center()
      .child(h_flex().flex_none().gap(6).items_center().font_semibold().text_color(GOLD).child(c.icon).child(c.text))
      .when(!this.narrow, el => el.child(label(space?.machine ? "server" : "monitor", space?.machine ?? "This computer")))
      .when(Boolean(branch) && !this.narrow, el => el.child(label("branch", branch)))
      .when(of("working").length > 0, el => el.child(pill("working", "✨", t.working ?? "#5eb1ef", plural(of("working").length, "elf working", "elves working"))))
      .when(of("blocked").length > 0, el => el.child(pill("blocked", "🔔", t.blocked ?? "#e5484d", plural(of("blocked").length, "needs you", "need you"), of("blocked")[0])))
      .when(of("done").length > 0, el => el.child(pill("done", "🎁", t.done ?? "#46a758", plural(of("done").length, "gift ready", "gifts ready"), of("done")[0])))
      .when(idle > 0, el => el.child(pill("idle", "❄", t.dim, `${idle} resting`)));
    const right = h_flex().flex_none().gap(12).items_center()
      .when(shared("holiday.lights") === false, el => el.child(div().text_color(t.dim).child("lights off")))
      .child(div().text_color("#cfe3ff").frames(["❄ · ✻ · ❅", "· ❅ · ❄ ·", "✻ · ❄ · ❅", "· ❄ · ✻ ·"], 700))
      .child(div().id("palette").text_color(t.dim).on_click(() => run("app.palette")).child(this.hint()));
    return h_flex().id("status-root").size_full().px(14).gap(12).items_center().bg(t.chrome)
      .text_size(11.8).text_color(t.muted)
      .on_size_change((size, cx) => { const n = size.width < 900; if (n !== this.narrow) { this.narrow = n; cx.notify(); } })
      .child(left).child(right);
  }
}
