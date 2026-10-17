import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ComponentProps } from "react";
import { Platform } from "react-native";

type ExternalUrl = `https://${string}` | `http://${string}`;

export function ExternalLink(
  props: Omit<ComponentProps<typeof Link>, "href"> & {
    href: ExternalUrl;
  },
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href}
      onPress={(event) => {
        if (Platform.OS !== "web") {
          event.preventDefault();
          WebBrowser.openBrowserAsync(props.href);
        }
      }}
    />
  );
}
