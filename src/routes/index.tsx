import { createFileRoute } from "@tanstack/react-router";
import { TraceApp } from "@/components/TraceApp";

export const Route = createFileRoute("/")({ component: TraceApp });
