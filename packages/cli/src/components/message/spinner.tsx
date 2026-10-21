import "opentui-spinner/react";
import { useTheme } from "../../providers/theme";

export function Spinner (){
  const {theme} = useTheme();

  return <spinner name="aesthetic" color={theme.accent}/>
}