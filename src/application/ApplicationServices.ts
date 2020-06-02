import { Inputs } from "pixi-boilerplate/inputs/Inputs";
import { Layout } from "pixi-boilerplate/layout/Layout";
import { interaction, Loader, Renderer, Container, Ticker } from "pixi.js";
import { Physics } from "pixi-boilerplate/physics/Physics";
import { SceneController } from "pixi-boilerplate/scenes/SceneController";

export type ApplicationServices = {
  components: Map<string, any>,
  inputs: Inputs,
  interaction: interaction.InteractionManager,
  layout: Layout,
  loader: Loader,
  physics: Physics,
  renderer: Renderer,
  scenes: SceneController,
  stage: Container,
  storage: Storage,
  ticker: Ticker
};