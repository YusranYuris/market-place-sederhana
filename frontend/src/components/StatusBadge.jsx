import { getOrderStatus } from "../utils/orderStatus.js";

function StatusBadge({ status }) {
  const { label, badge } = getOrderStatus(status);

  return <span className={`badge ${badge}`}>{label}</span>;
}

export default StatusBadge;
