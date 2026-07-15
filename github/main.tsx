import React from "react";
import { createRoot } from "react-dom/client";
import {
  AboutView,
  DigitalTwinView,
  ExperimentView,
  HomeView,
  ResearchView,
  type PageKey,
} from "../app/BioVoltExperience";
import "../app/globals.css";

const page = (document.body.dataset.page ?? "home") as PageKey;
const views = {
  home: <HomeView staticMode />,
  research: <ResearchView staticMode />,
  experiment: <ExperimentView staticMode />,
  twin: <DigitalTwinView staticMode />,
  about: <AboutView staticMode />,
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {views[page] ?? views.home}
  </React.StrictMode>,
);
