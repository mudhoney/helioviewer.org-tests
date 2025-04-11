import { test, expect } from "@playwright/test";
import { HelioviewerFactory, MobileView, DesktopView, MobileInterface } from "../../../page_objects/helioviewer_interface";

[MobileView, DesktopView].forEach((view) => {
  /**
   * A recurring issue in Helioviewer deals with computing which tiles should
   * be displayed in the viewport based on the screen size, zoom amount, and
   * the image container position. This test verifies that tiles are loaded
   * properly when the viewport region intersects with tile boundaries.
   *
   * This test was written for a bug tiles on the right edge of the viewport
   * are not loaded. This bug was reproducable with the following steps:
   * - Zoom In some amoun
   * - Zoom out
   * - Observe that not all tiles are loaded and there are black areas where there should be images.
   *
   * This test verifies that the black space does NOT remain, and that the tile does get loaded
   * when it is dragged into the viewport.
   */
  test.only(
    `[${view.name}] Verify 3D view opens and runs`,
    { tag: view.tag },
    async ({ page }, info) => {
      let hv = HelioviewerFactory.Create(view, page, info) as MobileInterface;
      await hv.Load("/");
      await hv.Toggle3D();
      await hv.WaitForLoadingComplete();
      await expect(page).toHaveScreenshot();
    });
});
