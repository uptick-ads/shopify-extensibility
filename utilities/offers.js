
export function hideOffers(current, start, total) {
  if (current == null || start == null || total == null) {
    return true;
  }

  if (current < 1 || start < 1) {
    return true;
  }

  if (current < start || current > total) {
    return true;
  }

  return false;
}
