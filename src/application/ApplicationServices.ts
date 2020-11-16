import { Inputs } from "pixi-boilerplate/inputs/Inputs";
import { Layout } from "pixi-boilerplate/layout/Layout";
import { interaction, Loader, Container, Ticker, Renderer } from "pixi.js";
import { Physics } from "pixi-boilerplate/physics/Physics";
import { SceneController } from "pixi-boilerplate/scenes/SceneController";
import { StateSystem } from "pixi-boilerplate/states/StateSystem";

export type ApplicationServices<G extends {[k: string]: any} = {[k: string]: any}> = {
  globals: G,
  inputs: Inputs,
  interaction: interaction.InteractionManager,
  layout: Layout,
  loader: Loader,
  physics: Physics,
  renderer: Renderer,
  scenes: SceneController,
  stage: Container,
  states: StateSystem,
  storage: Storage,
  ticker: Ticker
};