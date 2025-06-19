import {
  View,
  Grid,
  Image,
  Style
} from "@shopify/ui-extensions-react/checkout";

// Utils
import { isEmpty } from "../utilities/present.js";

export default function OfferImageWrapper({ image_url, children }) {
  if (isEmpty(image_url)) {
    return <>
      {children}
    </>;
  }

  return (
    <Grid columns={
        Style.default(["fill"])
             .when({viewportInlineSize: {min: "medium"}}, ["fill", "auto"])
      }
      rows={"auto"}
      spacing={"loose"}
    >
      <View display={
          Style.default("auto")
               .when({viewportInlineSize: {min: "medium"}}, "none")
        }
        inlineAlignment={"center"}
      >
        <View
          maxBlockSize={150}
          maxInlineSize={150}>
          <Image source={image_url} />
        </View>
      </View>
      <View>
        {children}
      </View>
      <View display={
          Style.default("none")
               .when({viewportInlineSize: {min: "medium"}}, "auto")
        }
        blockAlignment={"end"}
      >
        <View
          maxBlockSize={150}
          maxInlineSize={150}>
          <Image source={image_url} />
        </View>
      </View>
    </Grid>
  );
}
