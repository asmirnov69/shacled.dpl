export function generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

export function get_uri(uri_scheme, s) {
    return "<" + uri_scheme + ":" + s + ">";
}
