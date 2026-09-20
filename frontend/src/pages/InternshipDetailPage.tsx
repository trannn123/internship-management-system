import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInternshipById } from "../api/internship-api";
import type { Internship } from "../types";

function InternshipDetailPage() {
  const { id } = useParams();

  const [internship, setInternship] =
    useState<Internship | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInternship() {
      if (!id) {
        setError("Không tìm thấy mã thực tập.");
        setLoading(false);
        return;
      }

      try {
        const data = await getInternshipById(Number(id));
        setInternship(data);
      } catch (error) {
        console.error(
          "Failed to load internship:",
          error
        );
        setError("Không thể tải thông tin thực tập.");
      } finally {
        setLoading(false);
      }
    }

    loadInternship();
  }, [id]);

  if (loading) {
    return <p>Đang tải thông tin thực tập...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!internship) {
    return <p>Không tìm thấy đợt thực tập.</p>;
  }

  return (
    <div>
      <h2>Chi tiết thực tập</h2>

      <p>
        <strong>Mã internship:</strong>{" "}
        {internship.id}
      </p>

      <p>
        <strong>Vị trí:</strong>{" "}
        {internship.position}
      </p>

      <p>
        <strong>Mô tả:</strong>{" "}
        {internship.description}
      </p>

      <p>
        <strong>Doanh nghiệp:</strong>{" "}
        {internship.companyId ?? "Chưa có"}
      </p>

      <p>
        <strong>Giảng viên:</strong>{" "}
        {internship.lecturerId ?? "Chưa có"}
      </p>

      <p>
        <strong>Ngày bắt đầu:</strong>{" "}
        {internship.startDate}
      </p>

      <p>
        <strong>Ngày kết thúc:</strong>{" "}
        {internship.endDate}
      </p>

      <p>
        <strong>Trạng thái:</strong>{" "}
        {internship.status}
      </p>
    </div>
  );
}

export default InternshipDetailPage;