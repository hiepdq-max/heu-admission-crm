export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function withAdmissionSegmentParam(
  href: string,
  segmentId?: string | null,
) {
  if (!segmentId) {
    return href;
  }

  const url = new URL(href, "http://heu.local");
  url.searchParams.set("segment", segmentId);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function withoutAdmissionSegmentParam(href: string) {
  const url = new URL(href, "http://heu.local");
  url.searchParams.delete("segment");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/segments";
  }

  return value;
}

export function workspaceRedirectPath(returnTo: string, segmentId: string | null) {
  const safePath = safeReturnPath(returnTo);

  if (!segmentId) {
    return withoutAdmissionSegmentParam(safePath);
  }

  if (safePath === "/segments" || safePath.startsWith("/segments/")) {
    return `/segments/${segmentId}`;
  }

  return withAdmissionSegmentParam(safePath, segmentId);
}
