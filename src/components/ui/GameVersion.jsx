import packageInfo from "../../../package.json";

export default function GameVersion() {
  return (
    <span className="version-badge">Version {packageInfo.version}</span>
  );
}
