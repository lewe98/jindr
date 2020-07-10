package com.thm.jindr;

import android.os.Build;
import android.os.Bundle;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      if(Build.VERSION.SDK_INT >= 24 ){
        ServiceWorkerController swController = ServiceWorkerController.getInstance();

        swController.setServiceWorkerClient(new ServiceWorkerClient() {
          @Override
          public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
            return bridge.getLocalServer().shouldInterceptRequest(request);
          }
        });
      }
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
    }});
  }
}
