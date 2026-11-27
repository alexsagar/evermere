import { Passage } from "../Passage";
import { passageRoom } from "../rooms";
import { devOnly } from "../../dev-only";

export default async function Page() {
  devOnly();
  return <Passage room={await passageRoom("library")} />;
}
