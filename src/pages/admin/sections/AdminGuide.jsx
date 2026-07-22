import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, BookOpen, Users, CreditCard, LayoutGrid, Award, Trophy,
  Terminal, Megaphone, Package, Bell, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, Info, Zap, Filter, Tag,
} from 'lucide-react';
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['Tất cả', 'Người dùng', 'Nội dung', 'Tài chính', 'Marketing', 'Hệ thống'];

function getGuides(t) {
  return [

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'dashboard-overview',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: t('admin.guide.dashboard-overview.title'),
    summary: t('admin.guide.dashboard-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.dashboard-overview.steps.0') },
      { type: 'step', text: t('admin.guide.dashboard-overview.steps.1') },
      { type: 'step', text: t('admin.guide.dashboard-overview.steps.2') },
      { type: 'step', text: t('admin.guide.dashboard-overview.steps.3') },
      { type: 'step', text: t('admin.guide.dashboard-overview.steps.4') },
      { type: 'warn', text: t('admin.guide.dashboard-overview.steps.5') },
    ],
  },
  {
    id: 'dashboard-revenue-chart',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: t('admin.guide.dashboard-revenue-chart.title'),
    summary: t('admin.guide.dashboard-revenue-chart.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.dashboard-revenue-chart.steps.0') },
      { type: 'step', text: t('admin.guide.dashboard-revenue-chart.steps.1') },
      { type: 'step', text: t('admin.guide.dashboard-revenue-chart.steps.2') },
      { type: 'step', text: t('admin.guide.dashboard-revenue-chart.steps.3') },
      { type: 'info', text: t('admin.guide.dashboard-revenue-chart.steps.4') },
    ],
  },
  {
    id: 'dashboard-user-donut',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: t('admin.guide.dashboard-user-donut.title'),
    summary: t('admin.guide.dashboard-user-donut.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.dashboard-user-donut.steps.0') },
      { type: 'step', text: t('admin.guide.dashboard-user-donut.steps.1') },
      { type: 'step', text: t('admin.guide.dashboard-user-donut.steps.2') },
      { type: 'info', text: t('admin.guide.dashboard-user-donut.steps.3') },
    ],
  },
  {
    id: 'dashboard-plan-bar',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: t('admin.guide.dashboard-plan-bar.title'),
    summary: t('admin.guide.dashboard-plan-bar.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.dashboard-plan-bar.steps.0') },
      { type: 'step', text: t('admin.guide.dashboard-plan-bar.steps.1') },
      { type: 'step', text: t('admin.guide.dashboard-plan-bar.steps.2') },
      { type: 'info', text: t('admin.guide.dashboard-plan-bar.steps.3') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NGƯỜI DÙNG
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'user-view',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-view.title'),
    summary: t('admin.guide.user-view.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-view.steps.0') },
      { type: 'step', text: t('admin.guide.user-view.steps.1') },
      { type: 'step', text: t('admin.guide.user-view.steps.2') },
      { type: 'step', text: t('admin.guide.user-view.steps.3') },
      { type: 'step', text: t('admin.guide.user-view.steps.4') },
      { type: 'info', text: t('admin.guide.user-view.steps.5') },
    ],
  },
  {
    id: 'user-detail-info',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-detail-info.title'),
    summary: t('admin.guide.user-detail-info.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-detail-info.steps.0') },
      { type: 'step', text: t('admin.guide.user-detail-info.steps.1') },
      { type: 'step', text: t('admin.guide.user-detail-info.steps.2') },
      { type: 'step', text: t('admin.guide.user-detail-info.steps.3') },
      { type: 'info', text: t('admin.guide.user-detail-info.steps.4') },
    ],
  },
  {
    id: 'user-detail-stats',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-detail-stats.title'),
    summary: t('admin.guide.user-detail-stats.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-detail-stats.steps.0') },
      { type: 'step', text: t('admin.guide.user-detail-stats.steps.1') },
      { type: 'step', text: t('admin.guide.user-detail-stats.steps.2') },
      { type: 'info', text: t('admin.guide.user-detail-stats.steps.3') },
    ],
  },
  {
    id: 'user-add',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-add.title'),
    summary: t('admin.guide.user-add.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-add.steps.0') },
      { type: 'step', text: t('admin.guide.user-add.steps.1') },
      { type: 'step', text: t('admin.guide.user-add.steps.2') },
      { type: 'step', text: t('admin.guide.user-add.steps.3') },
      { type: 'warn', text: t('admin.guide.user-add.steps.4') },
      { type: 'warn', text: t('admin.guide.user-add.steps.5') },
      { type: 'info', text: t('admin.guide.user-add.steps.6') },
    ],
  },
  {
    id: 'user-verify-mc',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-verify-mc.title'),
    summary: t('admin.guide.user-verify-mc.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-verify-mc.steps.0') },
      { type: 'step', text: t('admin.guide.user-verify-mc.steps.1') },
      { type: 'step', text: t('admin.guide.user-verify-mc.steps.2') },
      { type: 'step', text: t('admin.guide.user-verify-mc.steps.3') },
      { type: 'info', text: t('admin.guide.user-verify-mc.steps.4') },
      { type: 'warn', text: t('admin.guide.user-verify-mc.steps.5') },
    ],
  },
  {
    id: 'user-suspend',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-suspend.title'),
    summary: t('admin.guide.user-suspend.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-suspend.steps.0') },
      { type: 'step', text: t('admin.guide.user-suspend.steps.1') },
      { type: 'step', text: t('admin.guide.user-suspend.steps.2') },
      { type: 'warn', text: t('admin.guide.user-suspend.steps.3') },
      { type: 'warn', text: t('admin.guide.user-suspend.steps.4') },
      { type: 'info', text: t('admin.guide.user-suspend.steps.5') },
    ],
  },
  {
    id: 'user-password',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-password.title'),
    summary: t('admin.guide.user-password.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-password.steps.0') },
      { type: 'step', text: t('admin.guide.user-password.steps.1') },
      { type: 'step', text: t('admin.guide.user-password.steps.2') },
      { type: 'warn', text: t('admin.guide.user-password.steps.3') },
      { type: 'step', text: t('admin.guide.user-password.steps.4') },
      { type: 'info', text: t('admin.guide.user-password.steps.5') },
    ],
  },
  {
    id: 'user-notify-single',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-notify-single.title'),
    summary: t('admin.guide.user-notify-single.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-notify-single.steps.0') },
      { type: 'step', text: t('admin.guide.user-notify-single.steps.1') },
      { type: 'step', text: t('admin.guide.user-notify-single.steps.2') },
      { type: 'step', text: t('admin.guide.user-notify-single.steps.3') },
      { type: 'step', text: t('admin.guide.user-notify-single.steps.4') },
      { type: 'warn', text: t('admin.guide.user-notify-single.steps.5') },
      { type: 'info', text: t('admin.guide.user-notify-single.steps.6') },
    ],
  },
  {
    id: 'user-delete',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: t('admin.guide.user-delete.title'),
    summary: t('admin.guide.user-delete.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.user-delete.steps.0') },
      { type: 'step', text: t('admin.guide.user-delete.steps.1') },
      { type: 'step', text: t('admin.guide.user-delete.steps.2') },
      { type: 'warn', text: t('admin.guide.user-delete.steps.3') },
      { type: 'warn', text: t('admin.guide.user-delete.steps.4') },
      { type: 'info', text: t('admin.guide.user-delete.steps.5') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BÀI HỌC
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'lesson-view',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: t('admin.guide.lesson-view.title'),
    summary: t('admin.guide.lesson-view.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.lesson-view.steps.0') },
      { type: 'step', text: t('admin.guide.lesson-view.steps.1') },
      { type: 'step', text: t('admin.guide.lesson-view.steps.2') },
      { type: 'step', text: t('admin.guide.lesson-view.steps.3') },
      { type: 'info', text: t('admin.guide.lesson-view.steps.4') },
    ],
  },
  {
    id: 'lesson-add',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: t('admin.guide.lesson-add.title'),
    summary: t('admin.guide.lesson-add.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.lesson-add.steps.0') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.1') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.2') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.3') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.4') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.5') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.6') },
      { type: 'step', text: t('admin.guide.lesson-add.steps.7') },
      { type: 'warn', text: t('admin.guide.lesson-add.steps.8') },
      { type: 'info', text: t('admin.guide.lesson-add.steps.9') },
    ],
  },
  {
    id: 'lesson-edit',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: t('admin.guide.lesson-edit.title'),
    summary: t('admin.guide.lesson-edit.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.lesson-edit.steps.0') },
      { type: 'step', text: t('admin.guide.lesson-edit.steps.1') },
      { type: 'step', text: t('admin.guide.lesson-edit.steps.2') },
      { type: 'step', text: t('admin.guide.lesson-edit.steps.3') },
      { type: 'warn', text: t('admin.guide.lesson-edit.steps.4') },
    ],
  },
  {
    id: 'lesson-delete',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: t('admin.guide.lesson-delete.title'),
    summary: t('admin.guide.lesson-delete.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.lesson-delete.steps.0') },
      { type: 'step', text: t('admin.guide.lesson-delete.steps.1') },
      { type: 'step', text: t('admin.guide.lesson-delete.steps.2') },
      { type: 'warn', text: t('admin.guide.lesson-delete.steps.3') },
      { type: 'info', text: t('admin.guide.lesson-delete.steps.4') },
    ],
  },
  {
    id: 'lesson-reading-guide',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: t('admin.guide.lesson-reading-guide.title'),
    summary: t('admin.guide.lesson-reading-guide.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.lesson-reading-guide.steps.0') },
      { type: 'step', text: t('admin.guide.lesson-reading-guide.steps.1') },
      { type: 'step', text: t('admin.guide.lesson-reading-guide.steps.2') },
      { type: 'step', text: t('admin.guide.lesson-reading-guide.steps.3') },
      { type: 'info', text: t('admin.guide.lesson-reading-guide.steps.4') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ACADEMY
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'academy-overview',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-overview.title'),
    summary: t('admin.guide.academy-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.academy-overview.steps.0') },
      { type: 'step', text: t('admin.guide.academy-overview.steps.1') },
      { type: 'step', text: t('admin.guide.academy-overview.steps.2') },
      { type: 'info', text: t('admin.guide.academy-overview.steps.3') },
    ],
  },
  {
    id: 'academy-course-create',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-course-create.title'),
    summary: t('admin.guide.academy-course-create.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-course-create.steps.0') },
      { type: 'step', text: t('admin.guide.academy-course-create.steps.1') },
      { type: 'step', text: t('admin.guide.academy-course-create.steps.2') },
      { type: 'step', text: t('admin.guide.academy-course-create.steps.3') },
      { type: 'step', text: t('admin.guide.academy-course-create.steps.4') },
      { type: 'info', text: t('admin.guide.academy-course-create.steps.5') },
    ],
  },
  {
    id: 'academy-milestone',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-milestone.title'),
    summary: t('admin.guide.academy-milestone.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-milestone.steps.0') },
      { type: 'step', text: t('admin.guide.academy-milestone.steps.1') },
      { type: 'step', text: t('admin.guide.academy-milestone.steps.2') },
      { type: 'step', text: t('admin.guide.academy-milestone.steps.3') },
      { type: 'step', text: t('admin.guide.academy-milestone.steps.4') },
      { type: 'warn', text: t('admin.guide.academy-milestone.steps.5') },
    ],
  },
  {
    id: 'academy-content',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-content.title'),
    summary: t('admin.guide.academy-content.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-content.steps.0') },
      { type: 'step', text: t('admin.guide.academy-content.steps.1') },
      { type: 'step', text: t('admin.guide.academy-content.steps.2') },
      { type: 'step', text: t('admin.guide.academy-content.steps.3') },
      { type: 'step', text: t('admin.guide.academy-content.steps.4') },
      { type: 'step', text: t('admin.guide.academy-content.steps.5') },
      { type: 'step', text: t('admin.guide.academy-content.steps.6') },
      { type: 'info', text: t('admin.guide.academy-content.steps.7') },
    ],
  },
  {
    id: 'academy-content-reorder',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-content-reorder.title'),
    summary: t('admin.guide.academy-content-reorder.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-content-reorder.steps.0') },
      { type: 'step', text: t('admin.guide.academy-content-reorder.steps.1') },
      { type: 'step', text: t('admin.guide.academy-content-reorder.steps.2') },
      { type: 'info', text: t('admin.guide.academy-content-reorder.steps.3') },
    ],
  },
  {
    id: 'academy-content-remove',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-content-remove.title'),
    summary: t('admin.guide.academy-content-remove.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-content-remove.steps.0') },
      { type: 'step', text: t('admin.guide.academy-content-remove.steps.1') },
      { type: 'info', text: t('admin.guide.academy-content-remove.steps.2') },
      { type: 'warn', text: t('admin.guide.academy-content-remove.steps.3') },
    ],
  },
  {
    id: 'academy-quiz',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: t('admin.guide.academy-quiz.title'),
    summary: t('admin.guide.academy-quiz.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.academy-quiz.steps.0') },
      { type: 'step', text: t('admin.guide.academy-quiz.steps.1') },
      { type: 'step', text: t('admin.guide.academy-quiz.steps.2') },
      { type: 'step', text: t('admin.guide.academy-quiz.steps.3') },
      { type: 'step', text: t('admin.guide.academy-quiz.steps.4') },
      { type: 'info', text: t('admin.guide.academy-quiz.steps.5') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THI ĐẤU
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'competition-overview',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: t('admin.guide.competition-overview.title'),
    summary: t('admin.guide.competition-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.competition-overview.steps.0') },
      { type: 'info', text: t('admin.guide.competition-overview.steps.1') },
      { type: 'step', text: t('admin.guide.competition-overview.steps.2') },
      { type: 'info', text: t('admin.guide.competition-overview.steps.3') },
    ],
  },
  {
    id: 'competition-create',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: t('admin.guide.competition-create.title'),
    summary: t('admin.guide.competition-create.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.competition-create.steps.0') },
      { type: 'step', text: t('admin.guide.competition-create.steps.1') },
      { type: 'step', text: t('admin.guide.competition-create.steps.2') },
      { type: 'step', text: t('admin.guide.competition-create.steps.3') },
      { type: 'step', text: t('admin.guide.competition-create.steps.4') },
      { type: 'step', text: t('admin.guide.competition-create.steps.5') },
      { type: 'step', text: t('admin.guide.competition-create.steps.6') },
      { type: 'warn', text: t('admin.guide.competition-create.steps.7') },
      { type: 'warn', text: t('admin.guide.competition-create.steps.8') },
    ],
  },
  {
    id: 'competition-edit',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: t('admin.guide.competition-edit.title'),
    summary: t('admin.guide.competition-edit.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.competition-edit.steps.0') },
      { type: 'step', text: t('admin.guide.competition-edit.steps.1') },
      { type: 'step', text: t('admin.guide.competition-edit.steps.2') },
      { type: 'warn', text: t('admin.guide.competition-edit.steps.3') },
      { type: 'info', text: t('admin.guide.competition-edit.steps.4') },
    ],
  },
  {
    id: 'competition-leaderboard',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: t('admin.guide.competition-leaderboard.title'),
    summary: t('admin.guide.competition-leaderboard.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.competition-leaderboard.steps.0') },
      { type: 'step', text: t('admin.guide.competition-leaderboard.steps.1') },
      { type: 'step', text: t('admin.guide.competition-leaderboard.steps.2') },
      { type: 'step', text: t('admin.guide.competition-leaderboard.steps.3') },
      { type: 'info', text: t('admin.guide.competition-leaderboard.steps.4') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // GÓI & GIẢM GIÁ
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'plan-overview',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: t('admin.guide.plan-overview.title'),
    summary: t('admin.guide.plan-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.plan-overview.steps.0') },
      { type: 'info', text: t('admin.guide.plan-overview.steps.1') },
      { type: 'info', text: t('admin.guide.plan-overview.steps.2') },
      { type: 'step', text: t('admin.guide.plan-overview.steps.3') },
    ],
  },
  {
    id: 'plan-edit',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: t('admin.guide.plan-edit.title'),
    summary: t('admin.guide.plan-edit.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.plan-edit.steps.0') },
      { type: 'step', text: t('admin.guide.plan-edit.steps.1') },
      { type: 'step', text: t('admin.guide.plan-edit.steps.2') },
      { type: 'step', text: t('admin.guide.plan-edit.steps.3') },
      { type: 'step', text: t('admin.guide.plan-edit.steps.4') },
      { type: 'step', text: t('admin.guide.plan-edit.steps.5') },
      { type: 'warn', text: t('admin.guide.plan-edit.steps.6') },
      { type: 'warn', text: t('admin.guide.plan-edit.steps.7') },
    ],
  },
  {
    id: 'plan-discount',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: t('admin.guide.plan-discount.title'),
    summary: t('admin.guide.plan-discount.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.plan-discount.steps.0') },
      { type: 'step', text: t('admin.guide.plan-discount.steps.1') },
      { type: 'step', text: t('admin.guide.plan-discount.steps.2') },
      { type: 'step', text: t('admin.guide.plan-discount.steps.3') },
      { type: 'info', text: t('admin.guide.plan-discount.steps.4') },
      { type: 'warn', text: t('admin.guide.plan-discount.steps.5') },
    ],
  },
  {
    id: 'coupon-create',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: t('admin.guide.coupon-create.title'),
    summary: t('admin.guide.coupon-create.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.coupon-create.steps.0') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.1') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.2') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.3') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.4') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.5') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.6') },
      { type: 'step', text: t('admin.guide.coupon-create.steps.7') },
      { type: 'info', text: t('admin.guide.coupon-create.steps.8') },
      { type: 'warn', text: t('admin.guide.coupon-create.steps.9') },
    ],
  },
  {
    id: 'coupon-manage',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: t('admin.guide.coupon-manage.title'),
    summary: t('admin.guide.coupon-manage.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.coupon-manage.steps.0') },
      { type: 'step', text: t('admin.guide.coupon-manage.steps.1') },
      { type: 'step', text: t('admin.guide.coupon-manage.steps.2') },
      { type: 'step', text: t('admin.guide.coupon-manage.steps.3') },
      { type: 'info', text: t('admin.guide.coupon-manage.steps.4') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // GIAO DỊCH
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'transaction-view',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: t('admin.guide.transaction-view.title'),
    summary: t('admin.guide.transaction-view.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.transaction-view.steps.0') },
      { type: 'step', text: t('admin.guide.transaction-view.steps.1') },
      { type: 'step', text: t('admin.guide.transaction-view.steps.2') },
      { type: 'step', text: t('admin.guide.transaction-view.steps.3') },
      { type: 'step', text: t('admin.guide.transaction-view.steps.4') },
    ],
  },
  {
    id: 'transaction-detail',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: t('admin.guide.transaction-detail.title'),
    summary: t('admin.guide.transaction-detail.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.transaction-detail.steps.0') },
      { type: 'step', text: t('admin.guide.transaction-detail.steps.1') },
      { type: 'step', text: t('admin.guide.transaction-detail.steps.2') },
      { type: 'info', text: t('admin.guide.transaction-detail.steps.3') },
    ],
  },
  {
    id: 'transaction-pending',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: t('admin.guide.transaction-pending.title'),
    summary: t('admin.guide.transaction-pending.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.transaction-pending.steps.0') },
      { type: 'step', text: t('admin.guide.transaction-pending.steps.1') },
      { type: 'step', text: t('admin.guide.transaction-pending.steps.2') },
      { type: 'warn', text: t('admin.guide.transaction-pending.steps.3') },
      { type: 'info', text: t('admin.guide.transaction-pending.steps.4') },
    ],
  },
  {
    id: 'transaction-refund',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: t('admin.guide.transaction-refund.title'),
    summary: t('admin.guide.transaction-refund.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.transaction-refund.steps.0') },
      { type: 'step', text: t('admin.guide.transaction-refund.steps.1') },
      { type: 'step', text: t('admin.guide.transaction-refund.steps.2') },
      { type: 'step', text: t('admin.guide.transaction-refund.steps.3') },
      { type: 'warn', text: t('admin.guide.transaction-refund.steps.4') },
      { type: 'info', text: t('admin.guide.transaction-refund.steps.5') },
    ],
  },
  {
    id: 'transaction-export',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: t('admin.guide.transaction-export.title'),
    summary: t('admin.guide.transaction-export.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.transaction-export.steps.0') },
      { type: 'step', text: t('admin.guide.transaction-export.steps.1') },
      { type: 'step', text: t('admin.guide.transaction-export.steps.2') },
      { type: 'info', text: t('admin.guide.transaction-export.steps.3') },
      { type: 'info', text: t('admin.guide.transaction-export.steps.4') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THÔNG BÁO
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'notif-overview',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-overview.title'),
    summary: t('admin.guide.notif-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.notif-overview.steps.0') },
      { type: 'info', text: t('admin.guide.notif-overview.steps.1') },
      { type: 'info', text: t('admin.guide.notif-overview.steps.2') },
      { type: 'step', text: t('admin.guide.notif-overview.steps.3') },
    ],
  },
  {
    id: 'notif-compose',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-compose.title'),
    summary: t('admin.guide.notif-compose.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.notif-compose.steps.0') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.1') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.2') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.3') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.4') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.5') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.6') },
      { type: 'step', text: t('admin.guide.notif-compose.steps.7') },
      { type: 'warn', text: t('admin.guide.notif-compose.steps.8') },
    ],
  },
  {
    id: 'notif-send',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-send.title'),
    summary: t('admin.guide.notif-send.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.notif-send.steps.0') },
      { type: 'step', text: t('admin.guide.notif-send.steps.1') },
      { type: 'step', text: t('admin.guide.notif-send.steps.2') },
      { type: 'step', text: t('admin.guide.notif-send.steps.3') },
      { type: 'info', text: t('admin.guide.notif-send.steps.4') },
      { type: 'warn', text: t('admin.guide.notif-send.steps.5') },
    ],
  },
  {
    id: 'notif-trigger',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-trigger.title'),
    summary: t('admin.guide.notif-trigger.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.notif-trigger.steps.0') },
      { type: 'step', text: t('admin.guide.notif-trigger.steps.1') },
      { type: 'step', text: t('admin.guide.notif-trigger.steps.2') },
      { type: 'step', text: t('admin.guide.notif-trigger.steps.3') },
      { type: 'step', text: t('admin.guide.notif-trigger.steps.4') },
      { type: 'info', text: t('admin.guide.notif-trigger.steps.5') },
    ],
  },
  {
    id: 'notif-history',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-history.title'),
    summary: t('admin.guide.notif-history.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.notif-history.steps.0') },
      { type: 'step', text: t('admin.guide.notif-history.steps.1') },
      { type: 'step', text: t('admin.guide.notif-history.steps.2') },
      { type: 'info', text: t('admin.guide.notif-history.steps.3') },
    ],
  },
  {
    id: 'notif-delete-draft',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: t('admin.guide.notif-delete-draft.title'),
    summary: t('admin.guide.notif-delete-draft.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.notif-delete-draft.steps.0') },
      { type: 'step', text: t('admin.guide.notif-delete-draft.steps.1') },
      { type: 'step', text: t('admin.guide.notif-delete-draft.steps.2') },
      { type: 'info', text: t('admin.guide.notif-delete-draft.steps.3') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MARKETING
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'marketing-social-add',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-social-add.title'),
    summary: t('admin.guide.marketing-social-add.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.3') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.4') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.5') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.6') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.7') },
      { type: 'step', text: t('admin.guide.marketing-social-add.steps.8') },
      { type: 'info', text: t('admin.guide.marketing-social-add.steps.9') },
    ],
  },
  {
    id: 'marketing-social-manage',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-social-manage.title'),
    summary: t('admin.guide.marketing-social-manage.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-social-manage.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-social-manage.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-social-manage.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-social-manage.steps.3') },
      { type: 'step', text: t('admin.guide.marketing-social-manage.steps.4') },
    ],
  },
  {
    id: 'marketing-template-create',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-template-create.title'),
    summary: t('admin.guide.marketing-template-create.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.3') },
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.4') },
      { type: 'step', text: t('admin.guide.marketing-template-create.steps.5') },
      { type: 'info', text: t('admin.guide.marketing-template-create.steps.6') },
      { type: 'warn', text: t('admin.guide.marketing-template-create.steps.7') },
    ],
  },
  {
    id: 'marketing-template-edit',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-template-edit.title'),
    summary: t('admin.guide.marketing-template-edit.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-template-edit.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-template-edit.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-template-edit.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-template-edit.steps.3') },
      { type: 'warn', text: t('admin.guide.marketing-template-edit.steps.4') },
    ],
  },
  {
    id: 'marketing-template-test',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-template-test.title'),
    summary: t('admin.guide.marketing-template-test.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-template-test.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-template-test.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-template-test.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-template-test.steps.3') },
      { type: 'warn', text: t('admin.guide.marketing-template-test.steps.4') },
      { type: 'info', text: t('admin.guide.marketing-template-test.steps.5') },
    ],
  },
  {
    id: 'marketing-campaign-send',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-campaign-send.title'),
    summary: t('admin.guide.marketing-campaign-send.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.3') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.4') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.5') },
      { type: 'step', text: t('admin.guide.marketing-campaign-send.steps.6') },
      { type: 'warn', text: t('admin.guide.marketing-campaign-send.steps.7') },
      { type: 'info', text: t('admin.guide.marketing-campaign-send.steps.8') },
    ],
  },
  {
    id: 'marketing-campaign-custom',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-campaign-custom.title'),
    summary: t('admin.guide.marketing-campaign-custom.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.3') },
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.4') },
      { type: 'step', text: t('admin.guide.marketing-campaign-custom.steps.5') },
      { type: 'warn', text: t('admin.guide.marketing-campaign-custom.steps.6') },
    ],
  },
  {
    id: 'marketing-campaign-history',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: t('admin.guide.marketing-campaign-history.title'),
    summary: t('admin.guide.marketing-campaign-history.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.marketing-campaign-history.steps.0') },
      { type: 'step', text: t('admin.guide.marketing-campaign-history.steps.1') },
      { type: 'step', text: t('admin.guide.marketing-campaign-history.steps.2') },
      { type: 'step', text: t('admin.guide.marketing-campaign-history.steps.3') },
      { type: 'info', text: t('admin.guide.marketing-campaign-history.steps.4') },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SERVER LOGS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'logs-overview',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-overview.title'),
    summary: t('admin.guide.logs-overview.summary'),
    steps: [
      { type: 'info', text: t('admin.guide.logs-overview.steps.0') },
      { type: 'info', text: t('admin.guide.logs-overview.steps.1') },
      { type: 'info', text: t('admin.guide.logs-overview.steps.2') },
      { type: 'info', text: t('admin.guide.logs-overview.steps.3') },
    ],
  },
  {
    id: 'logs-monitor',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-monitor.title'),
    summary: t('admin.guide.logs-monitor.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.logs-monitor.steps.0') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.1') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.2') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.3') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.4') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.5') },
      { type: 'step', text: t('admin.guide.logs-monitor.steps.6') },
      { type: 'info', text: t('admin.guide.logs-monitor.steps.7') },
    ],
  },
  {
    id: 'logs-read-error',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-read-error.title'),
    summary: t('admin.guide.logs-read-error.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.logs-read-error.steps.0') },
      { type: 'step', text: t('admin.guide.logs-read-error.steps.1') },
      { type: 'step', text: t('admin.guide.logs-read-error.steps.2') },
      { type: 'step', text: t('admin.guide.logs-read-error.steps.3') },
      { type: 'step', text: t('admin.guide.logs-read-error.steps.4') },
      { type: 'info', text: t('admin.guide.logs-read-error.steps.5') },
    ],
  },
  {
    id: 'logs-watchlist',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-watchlist.title'),
    summary: t('admin.guide.logs-watchlist.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.logs-watchlist.steps.0') },
      { type: 'step', text: t('admin.guide.logs-watchlist.steps.1') },
      { type: 'step', text: t('admin.guide.logs-watchlist.steps.2') },
      { type: 'step', text: t('admin.guide.logs-watchlist.steps.3') },
      { type: 'step', text: t('admin.guide.logs-watchlist.steps.4') },
      { type: 'info', text: t('admin.guide.logs-watchlist.steps.5') },
    ],
  },
  {
    id: 'logs-bookmark',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-bookmark.title'),
    summary: t('admin.guide.logs-bookmark.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.logs-bookmark.steps.0') },
      { type: 'step', text: t('admin.guide.logs-bookmark.steps.1') },
      { type: 'step', text: t('admin.guide.logs-bookmark.steps.2') },
      { type: 'step', text: t('admin.guide.logs-bookmark.steps.3') },
      { type: 'step', text: t('admin.guide.logs-bookmark.steps.4') },
      { type: 'info', text: t('admin.guide.logs-bookmark.steps.5') },
    ],
  },
  {
    id: 'logs-backend-down',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: t('admin.guide.logs-backend-down.title'),
    summary: t('admin.guide.logs-backend-down.summary'),
    steps: [
      { type: 'step', text: t('admin.guide.logs-backend-down.steps.0') },
      { type: 'step', text: t('admin.guide.logs-backend-down.steps.1') },
      { type: 'step', text: t('admin.guide.logs-backend-down.steps.2') },
      { type: 'step', text: t('admin.guide.logs-backend-down.steps.3') },
      { type: 'warn', text: t('admin.guide.logs-backend-down.steps.4') },
      { type: 'info', text: t('admin.guide.logs-backend-down.steps.5') },
    ],
  },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STEP_ICON = {
  step: { icon: CheckCircle2, color: 'text-emerald-400' },
  warn: { icon: AlertTriangle, color: 'text-amber-400' },
  info: { icon: Info, color: 'text-blue-400' },
  tip:  { icon: Zap, color: 'text-purple-400' },
};

function StepIcon({ type }) {
  const { icon: Icon, color } = STEP_ICON[type] || STEP_ICON.step;
  return <Icon size={13} className={`${color} shrink-0 mt-0.5`} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminGuide() {
  const { t } = useTranslation();
  const GUIDES = useMemo(() => getGuides(t), [t]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeSection, setActiveSection] = useState('Tất cả');
  const [expanded, setExpanded] = useState(null);
  const [sort, setSort] = useState('section');

  const sections = useMemo(() => {
    return ['Tất cả', ...new Set(GUIDES.map(g => g.section))];
  }, [GUIDES]);

  const filtered = useMemo(() => {
    let result = GUIDES;
    if (activeCategory !== 'Tất cả') result = result.filter(g => g.category === activeCategory);
    if (activeSection !== 'Tất cả') result = result.filter(g => g.section === activeSection);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.section.toLowerCase().includes(q) ||
        g.steps.some(s => s.text.toLowerCase().includes(q))
      );
    }
    if (sort === 'alpha') return [...result].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    if (sort === 'category') return [...result].sort((a, b) => a.category.localeCompare(b.category, 'vi'));
    return [...result].sort((a, b) => a.section.localeCompare(b.section, 'vi'));
  }, [GUIDES, search, activeCategory, activeSection, sort]);

  const grouped = useMemo(() => {
    if (sort !== 'section') return null;
    const map = {};
    filtered.forEach(g => {
      if (!map[g.section]) map[g.section] = [];
      map[g.section].push(g);
    });
    return map;
  }, [filtered, sort]);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const chipCls = (active) =>
    `px-3 py-1 text-[11px] font-semibold border cursor-pointer transition-colors shrink-0 ${
      active
        ? 'bg-gold/20 border-gold text-gold'
        : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:border-[--text-muted] hover:text-[--text-secondary]'
    }`;

  const renderCard = (guide) => {
    const isOpen = expanded === guide.id;
    const SectionIcon = guide.sectionIcon;
    return (
      <Card key={guide.id} className="bg-[--bg-surface] border border-[--border-subtle] overflow-hidden gap-0 shadow-none py-0">
        <Button
          onClick={() => toggle(guide.id)}
          hoverScale={1}
          className="w-full flex items-start gap-3 px-5 py-4 h-auto text-left hover:bg-[--bg-elevated] transition-colors"
        >
          <div className={`mt-0.5 shrink-0 ${guide.sectionColor}`}>
            <SectionIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-[--text-primary]">{guide.title}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 border bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]">
                {guide.category}
              </span>
            </div>
            <p className="text-[12px] text-[--text-muted] mt-0.5">{guide.summary}</p>
          </div>
          <span className="text-[--text-muted] shrink-0 mt-0.5">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </Button>

        {isOpen && (
          <div className="border-t border-[--border-subtle] px-5 py-4 space-y-2.5 bg-[--bg-elevated]">
            <p className="text-[10px] text-[--text-muted] uppercase tracking-wider font-semibold mb-3">
              Các bước thực hiện
            </p>
            {guide.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <StepIcon type={s.type} />
                <div className="flex-1">
                  {s.type === 'step' && (
                    <span className="text-[10px] font-bold text-[--text-muted] mr-1.5">
                      {guide.steps.filter((x, j) => x.type === 'step' && j <= i).length}.
                    </span>
                  )}
                  <span className={`text-[12px] leading-relaxed ${
                    s.type === 'warn' ? 'text-amber-300' :
                    s.type === 'info' ? 'text-blue-300' :
                    'text-[--text-secondary]'
                  }`}>
                    {s.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-bold text-[--text-primary] tracking-tight">Hướng dẫn Admin</h2>
        <p className="text-[12px] text-[--text-muted] mt-1">
          {GUIDES.length} quy trình · {sections.length - 1} module · Tĩnh — không cần kết nối DB
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
          <Input
            type="text"
            placeholder="Tìm quy trình, từ khoá..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-auto bg-[--bg-surface] border border-[--border-subtle] rounded-none pl-9 pr-4 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-500 focus-visible:ring-0 focus:border-[--text-muted]"
          />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Filter size={12} className="text-[--text-muted] ml-2" />
          <span className="text-[11px] text-[--text-muted]">Sắp xếp:</span>
          {[['section', 'Theo module'], ['alpha', 'A–Z'], ['category', 'Danh mục']].map(([val, label]) => (
            <Button key={val} onClick={() => setSort(val)} hoverScale={1} className={chipCls(sort === val) + " h-auto"}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-[10px] text-[--text-muted] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
          <Tag size={10} /> Danh mục công việc
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <Button key={c} onClick={() => setActiveCategory(c)} hoverScale={1} className={chipCls(activeCategory === c) + " h-auto"}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Section filter */}
      <div>
        <p className="text-[10px] text-[--text-muted] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
          <LayoutGrid size={10} /> Module
        </p>
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <Button key={s} onClick={() => setActiveSection(s)} hoverScale={1} className={chipCls(activeSection === s) + " h-auto"}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 py-2 border-t border-b border-[--border-subtle]">
        <span className="text-[12px] text-[--text-muted]">
          Hiển thị <span className="font-semibold text-[--text-primary]">{filtered.length}</span> / {GUIDES.length} quy trình
        </span>
        {(search || activeCategory !== 'Tất cả' || activeSection !== 'Tất cả') && (
          <Button
            onClick={() => { setSearch(''); setActiveCategory('Tất cả'); setActiveSection('Tất cả'); }}
            className="text-[11px] h-auto p-0 bg-transparent text-gold hover:text-amber-400 transition-colors"
          >
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[--text-muted] text-[13px]">Không tìm thấy quy trình phù hợp.</div>
      ) : grouped ? (
        Object.entries(grouped).map(([section, guides]) => {
          const SectionIcon = guides[0].sectionIcon;
          const color = guides[0].sectionColor;
          return (
            <div key={section} className="space-y-2">
              <div className="flex items-center gap-2 py-1">
                <SectionIcon size={14} className={color} />
                <span className="text-[12px] font-bold text-[--text-secondary] uppercase tracking-wider">{section}</span>
                <span className="text-[10px] text-[--text-muted] bg-[--bg-elevated] border border-[--border-subtle] px-1.5 py-0.5">{guides.length} quy trình</span>
              </div>
              <div className="space-y-1.5">
                {guides.map(renderCard)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="space-y-1.5">
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
}
