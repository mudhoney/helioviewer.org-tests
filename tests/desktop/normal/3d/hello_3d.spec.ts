import { test, expect, Page } from "@playwright/test";
import {
  HelioviewerFactory,
  MobileView,
  DesktopView,
  MobileInterface
} from "../../../page_objects/helioviewer_interface";

const gse2frameResponse = {
  coordinates: [
    {
      x: 0,
      y: 0,
      z: 0,
      time: "2024-12-31T00:05:00.000"
    }
  ]
};

/**
 * Helper function to set up the 3D scene for tests.
 */
async function Initialize3D(hv: MobileInterface, page: Page) {
  await hv.Load("/");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();
  // Set the observation date to a date with available data.
  await hv.SetObservationDateTimeFromDate(new Date("2024-12-31 00:00:00"));
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();
  const response = page.route(
    "**/gse2frame",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(gse2frameResponse)
      });
    },
    { times: 2 }
  );
  // This is the 3D model that the image will be rendered onto.
  const glbResponse = page.waitForResponse("**/zit.glb");

  // Now start 3D
  await hv.Toggle3D();
  // Wait for the network requests to complete
  await response;
  // Expect the model to be loaded.
  await glbResponse;
  // Wait for the page to process the result by rendering the image.
  await page.waitForTimeout(1000);
}

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
  test(`[${view.name}] Verify 3D view opens and runs`, { tag: view.tag }, async ({ page }, info) => {
    // Firefox in playwright does not allow webgl2 creation.
    // May need to test manually on a firefox installation, but it is working
    // in other browsers
    if (page.context().browser().browserType().name() === "firefox") {
      test.skip();
    }

    let hv = HelioviewerFactory.Create(view, page, info) as MobileInterface;
    await Initialize3D(hv, page);
    await expect(page).toHaveScreenshot();
  });

  test(`[${view.name}] Turn sun sideways`, { tag: view.tag }, async ({ page }, info) => {
    // Firefox in playwright does not allow webgl2 creation.
    // May need to test manually on a firefox installation, but it is working
    // in other browsers
    if (page.context().browser().browserType().name() === "firefox") {
      test.skip();
    }

    let hv = HelioviewerFactory.Create(view, page, info) as MobileInterface;
    await Initialize3D(hv, page);
    // Drag to the right to rotate the sun.
    await page.mouse.move(page.viewportSize().width / 2, page.viewportSize().height / 3);
    await page.mouse.down();
    await page.mouse.move(page.viewportSize().width / 2 + 100, page.viewportSize().height / 3);
    await page.mouse.up();
    await expect(page).toHaveScreenshot();
  });

  test.only(`[${view.name}] Load State without enable3d in state`, { tag: view.tag }, async ({ page }, info) => {
    // Firefox in playwright does not allow webgl2 creation.
    // May need to test manually on a firefox installation, but it is working
    // in other browsers
    if (page.context().browser().browserType().name() === "firefox") {
      test.skip();
    }

    let hv = HelioviewerFactory.Create(view, page, info) as MobileInterface;
    const webClientStateRequest = page.waitForRequest('**/getWebClientState');
    // Set up listener for loading the web client state
    await page.route('**/getWebClientState**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(loadState3dResponse)
      });
    });

    // Load the page, it will load the state we gave it above. Which does
    // not contain enable3d
    await hv.Load("/?loadState=something");
    await webClientStateRequest;
    await hv.WaitForLoadingComplete();

    // After the page has loaded, we expect enable3d to be false
    expect(await page.evaluate(() => eval("Helioviewer.userSettings.get('state.enable3d')"))).toBe(false);
    // 3d button should not be active (no 3d buttons with active css)
    expect(await page.locator(".js-3d-toggle.active").count()).toBe(0);
    // No elements should be hidden for 3d
    expect(await page.locator(".toggle-3d.masked").count()).toBe(0);
  });
});

const loadState3dResponse = {"status_code":200,"status_txt":"OK","data":{"date":1735603271000,"imageScale":4.84088176,"centerX":-174.58208757126707,"centerY":-128.78993573759288,"imageLayers":[{"visible":true,"opacity":100,"uiLabels":[{"label":"Observatory","name":"SDO"},{"label":"Instrument","name":"AIA"},{"label":"Measurement","name":"94"}],"difference":0,"diffCount":60,"diffTime":1,"baseDiffTime":"2025-05-13T17:49:32.000Z","sourceId":8,"Observatory":"SDO","Instrument":"AIA","Measurement":"94"}],"eventLayers":{"tree_HEK":{"id":"HEK","visible":true,"markers_visible":true,"labels_visible":true,"layer_available_visible":true,"layers":[]},"tree_CCMC":{"id":"CCMC","visible":true,"markers_visible":true,"labels_visible":true,"layer_available_visible":true,"layers":[]},"tree_RHESSI":{"id":"RHESSI","visible":true,"markers_visible":true,"labels_visible":true,"layer_available_visible":true,"layers":[]}},"celestialBodies":{"soho":[],"stereo_a":[],"stereo_b":[]},"enable3d":false}};
