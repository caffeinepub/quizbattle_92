import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Outlet,
} from "@tanstack/react-router";
import { AuthLayout } from "./components/AuthLayout";
import { DashboardPage } from "./components/DashboardPage";
import { QuizzesPage } from "./components/QuizzesPage";
import { QuizBuilder } from "./components/QuizBuilder";
import { ReportsListPage } from "./components/ReportsListPage";
import { ReportPage } from "./components/ReportPage";
import { PlayerRoute } from "./components/PlayerRoute";

const rootRoute = createRootRoute({
  component: Outlet,
});

// Auth layout wraps all host routes
const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/",
  component: DashboardPage,
});

const quizzesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "quizzes",
  component: QuizzesPage,
});

const builderNewRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "builder",
  component: function NewQuizBuilder() {
    return <QuizBuilder quizId={null} />;
  },
});

const builderEditRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "builder/$quizId",
  component: function EditQuizBuilder() {
    const { quizId } = builderEditRoute.useParams();
    return <QuizBuilder quizId={Number(quizId)} />;
  },
});

const reportsListRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "reports",
  component: ReportsListPage,
});

const reportRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "reports/$reportId",
  component: function ReportDetail() {
    const { reportId } = reportRoute.useParams();
    return <ReportPage reportId={Number(reportId)} />;
  },
});

// Player route — no auth required
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "join",
  component: PlayerRoute,
});

const routeTree = rootRoute.addChildren([
  authLayout.addChildren([
    dashboardRoute,
    quizzesRoute,
    builderNewRoute,
    builderEditRoute,
    reportsListRoute,
    reportRoute,
  ]),
  joinRoute,
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
