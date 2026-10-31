import { useEffect, useState } from "react";
import "./App.css";

const API =
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "") +
  "/api/devices";
const STATUSES = ["Đang sử dụng", "Hư hỏng", "Đang sửa chữa", "Ngừng sử dụng"];
const EMPTY = {
  deviceId: "",
  name: "",
  deviceType: "",
  room: "",
  brand: "",
  model: "",
  quantity: 1,
  status: "Đang sử dụng",
  purchaseDate: "",
  description: "",
};
const badge = {
  "Đang sử dụng": "ok",
  "Hư hỏng": "bad",
  "Đang sửa chữa": "fix",
  "Ngừng sử dụng": "off",
};

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.errors ? data.errors.join(", ") : data.message || "Có lỗi xảy ra",
    );
  }
  return data;
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = async (kw = search) => {
    setLoading(true);
    setError("");
    try {
      setDevices(
        await request(kw ? `${API}?search=${encodeURIComponent(kw)}` : API),
      );
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "Không kết nối được máy chủ"
          : e.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const notify = (m) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 3000);
  };

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setError("");
  };

  const openEdit = (d) => {
    setForm({
      ...d,
      purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : "",
    });
    setEditingId(d._id);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        purchaseDate: form.purchaseDate || undefined,
      });
      if (editingId)
        await request(`${API}/${editingId}`, { method: "PUT", body });
      else await request(API, { method: "POST", body });
      setForm(null);
      notify(editingId ? "Cập nhật thành công" : "Thêm thiết bị thành công");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Xóa thiết bị ${d.name}?`)) return;
    try {
      await request(`${API}/${d._id}`, { method: "DELETE" });
      notify("Đã xóa thiết bị");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>

      <div className="toolbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            placeholder="Tìm theo mã, tên, loại, phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Tìm kiếm</button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              load("");
            }}
          >
            Xóa lọc
          </button>
        </form>
        <button className="primary" onClick={openAdd}>
          + Thêm thiết bị
        </button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && !form && <div className="alert error">{error}</div>}
      {loading && <p>Đang tải...</p>}

      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Phòng</th>
            <th>SL</th>
            <th>Tình trạng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {!loading && devices.length === 0 && (
            <tr>
              <td colSpan="7">Không có thiết bị</td>
            </tr>
          )}
          {devices.map((d) => (
            <tr key={d._id}>
              <td>{d.deviceId}</td>
              <td>{d.name}</td>
              <td>{d.deviceType}</td>
              <td>{d.room}</td>
              <td>{d.quantity}</td>
              <td>
                <span className={`badge ${badge[d.status]}`}>{d.status}</span>
              </td>
              <td>
                <button onClick={() => setDetail(d)}>Chi tiết</button>
                <button onClick={() => openEdit(d)}>Sửa</button>
                <button className="danger" onClick={() => remove(d)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && (
        <div className="modal">
          <div className="box">
            <h2>Chi tiết thiết bị</h2>
            {[
              ["Mã thiết bị", detail.deviceId],
              ["Tên", detail.name],
              ["Loại", detail.deviceType],
              ["Phòng", detail.room],
              ["Hãng", detail.brand],
              ["Model", detail.model],
              ["Số lượng", detail.quantity],
              ["Tình trạng", detail.status],
              [
                "Ngày mua",
                detail.purchaseDate
                  ? new Date(detail.purchaseDate).toLocaleDateString("vi-VN")
                  : "",
              ],
              ["Mô tả", detail.description],
            ].map(([k, v]) => (
              <p key={k}>
                <b>{k}:</b> {v}
              </p>
            ))}
            <button onClick={() => setDetail(null)}>Đóng</button>
          </div>
        </div>
      )}

      {form && (
        <div className="modal">
          <form className="box" onSubmit={save}>
            <h2>{editingId ? "Cập nhật thiết bị" : "Thêm thiết bị"}</h2>
            {error && <div className="alert error">{error}</div>}
            <label>
              Mã thiết bị *
              <input
                value={form.deviceId}
                onChange={set("deviceId")}
                required
              />
            </label>
            <label>
              Tên thiết bị *
              <input value={form.name} onChange={set("name")} required />
            </label>
            <label>
              Loại thiết bị *
              <input
                value={form.deviceType}
                onChange={set("deviceType")}
                required
              />
            </label>
            <label>
              Phòng học *
              <input value={form.room} onChange={set("room")} required />
            </label>
            <label>
              Hãng
              <input value={form.brand} onChange={set("brand")} />
            </label>
            <label>
              Model
              <input value={form.model} onChange={set("model")} />
            </label>
            <label>
              Số lượng *
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={set("quantity")}
                required
              />
            </label>
            <label>
              Tình trạng
              <select value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Ngày mua
              <input
                type="date"
                value={form.purchaseDate}
                onChange={set("purchaseDate")}
              />
            </label>
            <label>
              Mô tả
              <textarea
                value={form.description}
                onChange={set("description")}
              />
            </label>
            <div>
              <button className="primary">Lưu</button>{" "}
              <button type="button" onClick={() => setForm(null)}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
