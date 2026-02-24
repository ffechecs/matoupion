import { ofetch } from "ofetch";
import { useCookie } from "./useCookie";

let isRedirectingTo401 = false;

function handleUnauthorized() {
  if (isRedirectingTo401) return;
  if (window.location.pathname === "/login") return;
  isRedirectingTo401 = true;

  useCookie("accessToken").value = null;
  useCookie("userData").value = null;

  window.location.href = "/login";
}

const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL,
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      ((options.credentials = "include"),
        (options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        } as any));
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      handleUnauthorized();
    }
  },
});

export { $api };
export default $api;
