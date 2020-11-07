import { Inputs } from "pixi-boilerplate/inputs/Inputs";
import { Layout } from "pixi-boilerplate/layout/Layout";
import { interaction, Loader, Container, Ticker } from "pixi.js";
import { Physics } from "pixi-boilerplate/physics/Physics";
import { SceneController } from "pixi-boilerplate/scenes/SceneController";
import { RendererSystem } from "pixi-boilerplate/renderer/RendererSystem";
import { StateSystem } from "pixi-boilerplate/states/StateSystem";

export type ApplicationServices = {
  components: Map<string, any>,
  inputs: Inputs,
  interaction: interaction.InteractionManager,
  layout: Layout,
  loader: Loader,
  physics: Physics,
  renderer: RendererSystem,
  scenes: SceneController,
  stage: Container,
  states: StateSystem,
  storage: Storage,
  ticker: Ticker
};