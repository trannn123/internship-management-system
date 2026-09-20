import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInternship } from "../api/internship-api";

function CreateInternshipPage() {
  const navigate = useNavigate();

  const [companyId, setCompanyId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await createInternship({
        companyId: companyId ? Number(companyId) : null,
        lecturerId: lecturerId ? Number(lecturerId) : null,
        position,
        description,
        startDate,
        endDate,
      });

      navigate("/student");
    } catch (error) {
      console.error("Failed to create internship:", error);
      setError("Không thể tạo đăng ký thực tập.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Đăng ký thực tập</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="companyId">
            Mã doanh nghiệp
          </label>

          <input
            id="companyId"
            type="number"
            value={companyId}
            onChange={(event) =>
              setCompanyId(event.target.value)
            }
            placeholder="Ví dụ: 1"
          />
        </div>

        <div>
          <label htmlFor="lecturerId">
            Mã giảng viên
          </label>

          <input
            id="lecturerId"
            type="number"
            value={lecturerId}
            onChange={(event) =>
              setLecturerId(event.target.value)
            }
            placeholder="Ví dụ: 1"
          />
        </div>

        <div>
          <label htmlFor="position">
            Vị trí thực tập
          </label>

          <input
            id="position"
            type="text"
            value={position}
            onChange={(event) =>
              setPosition(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="description">
            Mô tả
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="startDate">
            Ngày bắt đầu
          </label>

          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="endDate">
            Ngày kết thúc
          </label>

          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Đang gửi..." : "Đăng ký thực tập"}
        </button>
      </form>
    </div>
  );
}

export default CreateInternshipPage;