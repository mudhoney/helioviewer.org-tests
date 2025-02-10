import { expect, test } from "@playwright/test";
import { Helioviewer } from "../../../page_objects/helioviewer";

/*
 * This is for overriding all tests to include Hinode/XRT/
 */
test.beforeEach(async ({ page }) => {
  await page.route("**/*action=getDataSources*", async (route) => {
    // Fetch original response.
    const response = await route.fetch();
    // Add a prefix to the title.
    const newJson = await response.json();
    const xrt = newJson["Hinode"]["XRT"];
    xrt["Any"] = {
      Any: xrt["Any"]["Any"]
    };
    xrt["C_poly"] = {
      Any: {
        sourceId: 10012,
        nickname: "XRT C_poly/Any",
        layeringOrder: 1,
        start: "1991-09-11 00:00:00",
        end: "2025-02-10 17:17:07",
        uiLabels: [
          { label: "Observatory", name: "Hinode" },
          { label: "Instrument", name: "XRT" },
          { label: "Filter Wheel 1", name: "C_poly" },
          { label: "Filter Wheel 2", name: "Any" }
        ]
      }
    };
    xrt["Al_poly"] = {
      Open: xrt["Al_poly"]["Open"]
    };
    xrt["Be_med"] = {
      Open: xrt["Be_med"]["Open"]
    };
    xrt["Be_thin"] = {
      Open: xrt["Be_thin"]["Open"]
    };

    await route.fulfill({
      json: newJson
    });
  });
});

/**
 * Loads HINODE/XRT/C-poly to validate there is no image
 * Expect for a there is no image notification
 */
test("When there is no image for a given layer there should be warning notification to indicate", async ({
  page
}, info) => {
  let hv = new Helioviewer(page, info);

  // 1. LOAD HV
  await hv.Load();
  await hv.CloseAllNotifications();
  await hv.OpenSidebar();

  // 2. CHANGE LAYER 0 TO HINODE
  const layer = await hv.getImageLayer(0);
  await layer.set("Observatory:", "Hinode");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  // 3. SELECT NON-IMAGE C-POLY
  await layer.set("Filter Wheel 1:", "C-poly");
  await hv.WaitForLoadingComplete();

  await hv.assertNotification("warn", "No data of the requested type (XRT C_poly/Any) are currently available");
});

/**
 * This test tries to validate the ui requirements if there is no image for the layer.
 * Loads HINODE/XRT/C-poly to validate there is no image
 * Loads SDO to validate there is image again
 * Loads HINODE/XRT/C-poly again to validate there is no image again
 */
test("When there is no image for a given layer there should be updates in layer UI to indicate", async ({
  page
}, info) => {
  let hv = new Helioviewer(page, info);

  // 1. LOAD HV
  await hv.Load();
  await hv.CloseAllNotifications();
  await hv.OpenSidebar();

  // 2. CHANGE LAYER 0 TO HINODE
  const layer = await hv.getImageLayer(0);
  await layer.set("Observatory:", "Hinode");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  // 3. SELECT NON-IMAGE C-POLY
  await layer.set("Filter Wheel 1:", "C-poly");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  // ASSERT ALL NEW FEATURES WITH NO IMAGE
  await layer.assertHasNoNextImage();
  await layer.assertHasNoPreviousImage();
  await layer.assertDifferenceControlsNotVisible();
  await layer.assertHasNoImageTimestampInformation();
  await layer.assertHasNoNextImage();
  await layer.assertHasNoImageHeaderControls();
  await layer.assertHasNoJp2DownloadControls();

  // 4. SELECT BACK TO SOMETHING USABLE
  await layer.set("Observatory:", "SDO");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  await layer.assertHasPreviousImage();
  await layer.assertHasNoNextImage();
  await layer.assertHasImageTimestampInformation();
  await layer.assertDifferenceControlsVisible();
  await layer.assertHasImageHeaderControls();
  await layer.assertHasJp2DownloadControls();

  // ASSERT SCRENSHOTS SHOULD MATCH NOW
  await layer.set("Observatory:", "Hinode");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();
  await layer.set("Filter Wheel 1:", "C-poly");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  await layer.assertHasNoNextImage();
  await layer.assertHasNoPreviousImage();
  await layer.assertDifferenceControlsNotVisible();
  await layer.assertHasNoImageTimestampInformation();
  await layer.assertHasNoImageHeaderControls();
  await layer.assertHasNoJp2DownloadControls();
});

/**
 * This test tries to validate when there is no image for a layer it should hide whatever image left inside the layer
 * Loads SOHO LASCO
 * Add another layer
 * Set new layer HINODE/XRT/C-poly again to get no image layer
 * Sun screenshot should not differ
 */
test("Where there is no image for a given layer image layer it should no affect on the sun image", async ({
  page
}, info) => {
  let hv = new Helioviewer(page, info);

  // 1. LOAD HV
  await hv.Load();
  await hv.CloseAllNotifications();
  await hv.OpenSidebar();

  // 2. CHANGE LAYER 0 TO SOHO
  const layer = await hv.getImageLayer(0);
  await layer.set("Observatory:", "SOHO");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();
  await layer.set("Instrument:", "LASCO");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  const sohoLasco = await hv.sunScreenshot("just_soho_lasco");

  // 3. ADD NO IMAGE LAYER Hinode/XRT/C-Poly
  await hv.AddImageLayer();
  const newlayer = await hv.getImageLayer(1);
  await newlayer.set("Observatory:", "Hinode");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();
  await newlayer.set("Filter Wheel 1:", "C-poly");
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  const sohoLascoWithNoImageLayer = await hv.sunScreenshot("soho_lasco_with_no_image_layer");

  expect(sohoLascoWithNoImageLayer).toBe(sohoLasco);
});
