import { createFetch } from "@vueuse/core";
import { destr } from "destr";
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

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_URL,
  fetchOptions: {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie("accessToken").value;
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      return { options };
    },
    afterFetch(ctx) {
      const { data, response } = ctx;

      let parsedData = null;
      try {
        parsedData = destr(data);
      } catch (error) {
        console.error(error);
      }

      return { data: parsedData, response };
    },
    onFetchError(ctx) {
      if (ctx.response?.status === 401) {
        handleUnauthorized();
      }
      return ctx;
    },
  },
});
