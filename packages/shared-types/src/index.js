"use strict";
/**
 * SIH26095 NIRIKSHAN AI — Shared Types & Interfaces
 * Centralized Monitoring & Surprise Inspection Mobile App for DoSJE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sentiment = exports.MediaEvidenceType = exports.AnomalyType = exports.InspectionStatus = exports.CameraStatus = exports.RiskLevel = exports.Role = void 0;
// ==========================================
// ENUMS
// ==========================================
var Role;
(function (Role) {
    Role["OFFICIAL"] = "OFFICIAL";
    Role["INSPECTOR"] = "INSPECTOR";
    Role["NGO"] = "NGO";
    Role["BENEFICIARY"] = "BENEFICIARY";
})(Role || (exports.Role = Role = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var CameraStatus;
(function (CameraStatus) {
    CameraStatus["ONLINE"] = "ONLINE";
    CameraStatus["OFFLINE"] = "OFFLINE";
    CameraStatus["NO_SIGNAL"] = "NO_SIGNAL";
    CameraStatus["DELAYED"] = "DELAYED";
})(CameraStatus || (exports.CameraStatus = CameraStatus = {}));
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["ASSIGNED"] = "ASSIGNED";
    InspectionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InspectionStatus["COMPLETED"] = "COMPLETED";
    InspectionStatus["OVERDUE"] = "OVERDUE";
    InspectionStatus["ESCALATED"] = "ESCALATED";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
var AnomalyType;
(function (AnomalyType) {
    AnomalyType["ATTENDANCE_CAPACITY_EXCEEDED"] = "ATTENDANCE_CAPACITY_EXCEEDED";
    AnomalyType["ATTENDANCE_CCTV_MISMATCH"] = "ATTENDANCE_CCTV_MISMATCH";
    AnomalyType["REPEATED_ATTENDANCE_PATTERN"] = "REPEATED_ATTENDANCE_PATTERN";
    AnomalyType["CCTV_OFFLINE_DURING_EXPECTED_HOURS"] = "CCTV_OFFLINE_DURING_EXPECTED_HOURS";
    AnomalyType["INSPECTOR_GPS_MISMATCH"] = "INSPECTOR_GPS_MISMATCH";
    AnomalyType["DUPLICATE_EVIDENCE"] = "DUPLICATE_EVIDENCE";
    AnomalyType["MISSED_VIDEO_VERIFICATION"] = "MISSED_VIDEO_VERIFICATION";
    AnomalyType["OVERDUE_INSPECTION"] = "OVERDUE_INSPECTION";
    AnomalyType["SUDDEN_BEHAVIOR_CHANGE"] = "SUDDEN_BEHAVIOR_CHANGE";
})(AnomalyType || (exports.AnomalyType = AnomalyType = {}));
var MediaEvidenceType;
(function (MediaEvidenceType) {
    MediaEvidenceType["PHOTO"] = "PHOTO";
    MediaEvidenceType["VIDEO"] = "VIDEO";
    MediaEvidenceType["DOCUMENT"] = "DOCUMENT";
    MediaEvidenceType["VOICE_NOTE"] = "VOICE_NOTE";
})(MediaEvidenceType || (exports.MediaEvidenceType = MediaEvidenceType = {}));
var Sentiment;
(function (Sentiment) {
    Sentiment["POSITIVE"] = "POSITIVE";
    Sentiment["NEUTRAL"] = "NEUTRAL";
    Sentiment["NEGATIVE"] = "NEGATIVE";
})(Sentiment || (exports.Sentiment = Sentiment = {}));
