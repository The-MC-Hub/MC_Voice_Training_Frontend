import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Building2, Calendar, Edit3, ChevronRight, Heart,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getClientProfile } from "../services/clientService";
import Breadcrumb from "../components/ui/Breadcrumb";

const EVENT_TYPE_LABELS = {
  WEDDING: "Đám cưới",
  ENGAGEMENT: "Lễ hỏi",
  GALA_DINNER: "Gala Dinner",
  CORPORATE_CONFERENCE: "Hội nghị công ty",
  SEMINAR_WORKSHOP: "Hội thảo",
  PRODUCT_LAUNCH: "Ra mắt sản phẩm",
  TEAM_BUILDING: "Team Building",
  YEAR_END_PARTY: "Tất niên",
  GRAND_OPENING: "Khai trương",
  INAUGURATION: "Lễ khánh thành",
  CONCERT: "Hòa nhạc",
  FESTIVAL: "Lễ hội",
  EXHIBITION: "Triển lãm",
  BIRTHDAY_PARTY: "Sinh nhật",
  GRADUATION: "Tốt nghiệp",
  FASHION_SHOW: "Thời trang",
  COMPETITION: "Cuộc thi",
  CHARITY_EVENT: "Từ thiện",
  DIPLOMATIC_EVENT: "Ngoại giao",
  OTHER: "Khác",
};

const REGION_LABELS = {
  HA_NOI: "Hà Nội",
  HO_CHI_MINH: "TP. Hồ Chí Minh",
  DA_NANG: "Đà Nẵng",
  HAI_PHONG: "Hải Phòng",
  CAN_THO: "Cần Thơ",
  BINH_DUONG: "Bình Dương",
  DONG_NAI: "Đồng Nai",
  KHANH_HOA: "Khánh Hòa",
  LAM_DONG: "Lâm Đồng",
  QUANG_NINH: "Quảng Ninh",
  THANH_HOA: "Thanh Hóa",
  NGHE_AN: "Nghệ An",
  HA_TINH: "Hà Tĩnh",
  THUA_THIEN_HUE: "Thừa Thiên Huế",
  DA_NANG: "Đà Nẵng",
  QUANG_NAM: "Quảng Nam",
  BINH_DINH: "Bình Định",
  DAK_LAK: "Đắk Lắk",
  KIEN_GIANG: "Kiên Giang",
  LONG_AN: "Long An",
  TIEN_GIANG: "Tiền Giang",
  BEN_TRE: "Bến Tre",
  VINH_LONG: "Vĩnh Long",
  OTHER: "Khác",
};

const ClientProfilePublic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getClientProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load client profile:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-6 h-6 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const regionLabel = profile?.region
    ? REGION_LABELS[profile.region] || profile.customRegion || profile.region
    : "Chưa cập nhật";

  const displayRegion =
    profile?.region === "OTHER" && profile?.customRegion
      ? profile.customRegion
      : regionLabel;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-6">
      <Breadcrumb items={[{ label: "Hồ sơ khách hàng" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ khách hàng</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Thông tin của bạn dành cho MC
          </p>
        </div>
        <button
          onClick={() => navigate("/m/settings")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[13px] font-semibold hover:bg-amber-100 transition-colors"
        >
          <Edit3 size={14} />
          Chỉnh sửa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region */}
        <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-amber-500" />
            <h3 className="text-[13px] font-semibold text-gray-900">Khu vực</h3>
          </div>
          <p className="text-[14px] text-gray-700">{displayRegion}</p>
        </div>

        {/* Organization */}
        <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-amber-500" />
            <h3 className="text-[13px] font-semibold text-gray-900">Công ty / Tổ chức</h3>
          </div>
          <p className="text-[14px] text-gray-700">
            {profile?.organization || "Chưa cập nhật"}
          </p>
        </div>
      </div>

      {/* Preferred Event Types */}
      <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-amber-500" />
          <h3 className="text-[13px] font-semibold text-gray-900">Loại sự kiện quan tâm</h3>
        </div>
        {profile?.preferredEventTypes?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.preferredEventTypes.map((et) => (
              <span
                key={et}
                className="inline-flex items-center px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-[12px] font-medium text-amber-700"
              >
                {EVENT_TYPE_LABELS[et] || et}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">Chưa cập nhật</p>
        )}
      </div>

      {/* Bio */}
      <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-amber-500" />
          <h3 className="text-[13px] font-semibold text-gray-900">Giới thiệu</h3>
        </div>
        {profile?.bio ? (
          <div className="text-[14px] text-gray-700 leading-relaxed prose prose-xs max-w-none">
            {profile.bio.split('\n').map((p, i) => (
              <p key={i} className="mb-2 last:mb-0">{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">Chưa cập nhật</p>
        )}
      </div>

      {/* Link to edit in Settings */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigate("/m/settings")}
          className="inline-flex items-center gap-1.5 text-[13px] text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          Chỉnh sửa hồ sơ trong Cài đặt
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ClientProfilePublic;
