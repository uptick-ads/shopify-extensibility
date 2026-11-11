// Evaluates the behavior keys a survey segment carries: `field`, `show_when` and an event's `send_when`.

// `not_in` also holds while the field is empty, so a node can show until a matching value is picked.
export function holds(condition, fields = {}) {
  if (condition == null || condition.field == null) {
    return true;
  }

  const value = fields[condition.field];
  const empty = value == null || value === "";
  if (condition.present === true) {
    return !empty;
  }
  if (Array.isArray(condition.in)) {
    return !empty && condition.in.includes(value);
  }
  if (Array.isArray(condition.not_in)) {
    return empty || !condition.not_in.includes(value);
  }
  return true;
}

// The listed fields whose nodes are showing, so a comment typed into a box that was hidden again isn't sent.
export function visibleValues(root, names = [], fields = {}) {
  const visible = new Set();
  const walk = (node) => {
    if (node == null || typeof node !== "object") {
      return;
    }
    if (node.show_when != null && !holds(node.show_when, fields)) {
      return;
    }
    if (node.field?.name != null) {
      visible.add(node.field.name);
    }
    (node.children || []).forEach(walk);
  };
  walk(root);

  const values = {};
  names.forEach((name) => {
    const value = fields[name];
    if (visible.has(name) && value != null && value !== "") {
      values[name] = value;
    }
  });
  return values;
}
