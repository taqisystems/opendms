//import ApexCharts from 'apexcharts'
$(document).ready(function() {
    // Initialize the DataTable
    var table = $('#ducks-table').DataTable({ 
	    "dom": 't',
	    "order": [[ 1, "desc" ]],
            "processing": true,
	    "language": {
              "loadingRecords": '<div class="dt-empty">Loading data, please wait...</div>',
              "processing": '<div class="dt-empty">Processing...</div>',
	    },
	    ajax: {
               url: '/dashboard/json', 
	       dataSrc: 'data',
            },
	    columns: [
              { data: "duck_id", defaultContent: '', className: 'relative border-t border-transparent py-4 pl-4 pr-3 text-sm sm:pl-6', "render": function(data, type, row, meta) {
                    return '<div class="font-medium text-white">' + data + '</div><div class="absolute -top-px left-6 right-0 h-px bg-white/10"></div>';
                }
	      },
	      { data: "created_at", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1', render: function(data, type, row) {
                  return new Date(data).toLocaleString(navigator.language, {"12hour": false});
                }
	      },
	      { data: "topic", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "message_id", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "path", defaultContent: "", className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1', render: function(data) {
                  return data ? escapeHtml(data) : '<span class="italic text-gray-600">No path recorded</span>';
                }
	      },
	      { data: "display_text", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell', render: function(data, type, row) {
                  var payload = row.payload || '';
                  var isSosDev = /^SOS/i.test(payload) && /SRC:DEVICE/i.test(payload);
                  var isSosMob = /^SOS/i.test(payload) && !/SRC:DEVICE/i.test(payload);
                  var isMsg    = /^MSG\b/i.test(payload);
                  var tag = '';
                  if (isSosDev)      tag = '<span class="mr-1 inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">SOS HW</span>';
                  else if (isSosMob) tag = '<span class="mr-1 inline-flex items-center rounded bg-orange-500 px-1.5 py-0.5 text-xs font-bold text-white">SOS</span>';
                  else if (isMsg)    tag = '<span class="mr-1 inline-flex items-center rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-bold text-white">MSG</span>';
                  return tag + escapeHtml(data || payload || '');
                }
	      },
	      { data: "hops", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "duck_type", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "urgency_label", defaultContent: '', orderable: false, className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm lg:table-cell', render: function(data, type, row) {
                  if (data == null) return '<span class="text-gray-600">&mdash;</span>';
                  var u = urgencyMap[String(row.urgency_value)] || urgencyMap['0'];
                  return '<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ' + u.cls + '">' + escapeHtml(data) + '</span>';
                }
	      },
	      { data: "map_embed_url", defaultContent: null, orderable: false, className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm lg:table-cell', render: function(data, type, row) {
                  if (!data) return '<span class="text-gray-600">&mdash;</span>';
                  return '<button class="dt-map-btn inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20" data-embed="' + escapeHtml(data) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M8 1a5 5 0 0 1 5 5c0 2.813-2.45 5.714-4.168 7.603a1.145 1.145 0 0 1-1.664 0C5.45 11.714 3 8.813 3 6a5 5 0 0 1 5-5Zm0 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" /></svg>Map</button>';
                }
	      },
	    ],
    })

  $('#ducks-table tbody').on('click', '.dt-map-btn', function () {
    var tr  = $(this).closest('tr');
    var row = table.row(tr);
    var url = $(this).data('embed');
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('dt-map-shown');
    } else {
      row.child(
        '<div class="p-3 bg-gray-900">' +
          '<iframe src="' + url + '" class="w-full h-64 rounded-md border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
        '</div>'
      ).show();
      tr.addClass('dt-map-shown');
    }
  });

  $('#custom-filter').on('keydown', function() {
    table.ajax.reload();
  });

  // Link the custom input to the DataTables search functionality
  $('#custom-filter').on('keyup', function() {
      table.search(this.value).draw();
  });

  // rows drop down
  $('#table-select').val(table.page.len());
  // 3. Add a change event listener to your custom dropdown
  $('#table-select').on('change', function() {
      // Get the selected value
     var selectedValue = $(this).val();

     // Use the DataTables API to change the page length and redraw the table
        table
            .page.len(selectedValue)
            .draw();
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var urgencyMap = {
    '0': { label: 'Low',      cls: 'bg-green-500/20 text-green-400 ring-green-500/30' },
    '1': { label: 'Medium',   cls: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30' },
    '2': { label: 'Critical', cls: 'bg-red-500/20 text-red-400 ring-red-500/30' },
  };

  function urgencyBadge(raw) {
    var m = raw.match(/URGENCY:(\d)/i);
    var key = m ? m[1] : '0';
    var u = urgencyMap[key];
    if (!u) return '';
    return '<span class="ml-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ' + u.cls + '">' + u.label + '</span>';
  }

  function urgencyRow(raw) {
    var m = raw.match(/URGENCY:(\d)/i);
    var key = m ? m[1] : '0';
    var u = urgencyMap[key];
    if (!u) return '';
    return '<p class="mt-1 flex items-center gap-1.5 text-xs">' +
             '<span class="text-gray-500">Urgency:</span>' +
             '<span class="inline-flex items-center rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset ' + u.cls + '">' + u.label + '</span>' +
           '</p>';
  }

  console.log("pulldata loads...");
  function pollData() {
    $.ajax({
      url: '/dashboard/timeline', // Server script to fetch data
      method: 'GET',
      dataType: 'json', // Expecting JSON data from the server
      success: function(data) {
	  // Clear the table body to refresh with all data, or just append new rows
	  console.log('timeline is processing...');

          let oldFeed = localStorage.getItem('feed');
	  if (oldFeed == null) {
            oldFeed = data;
	  } else {
	    oldFeed = JSON.parse(oldFeed);
	  }

	  let template = [];
	  $.each(data.data, function(index, value) {
                  // Iterate over the received data and append rows to the table
                  const date = new Date(value.created_at);
                  const time24h = date.toLocaleTimeString('en-GB', {
                    hourCycle: 'h23',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  var payload     = value.payload || '';
                  var isSos       = /\bSOS\b/i.test(payload);
                  var isDevice    = /\bSRC:DEVICE\b/i.test(payload);
                  var isMsg       = /^MSG\b/i.test(payload);

                  var payloadHtml;
                  if (isSos && isDevice) {
                    payloadHtml = '<span class="inline-flex items-center gap-1 font-semibold text-red-400">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5 shrink-0"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>' +
                                    'SOS \u2014 Hardware Button</span>';
                  } else if (isSos) {
                    payloadHtml = '<span class="inline-flex items-center gap-1 font-semibold text-orange-400">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5 shrink-0"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>' +
                                    'SOS \u2014 Mobile App</span>';
                  } else if (isMsg) {
                    var textMatch = payload.match(/TEXT:(.+)$/i);
                    var msgText   = textMatch ? escapeHtml(textMatch[1].trim()) : escapeHtml(payload);
                    payloadHtml   = '<span class="inline-flex items-center gap-1 text-gray-300">' +
                                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5 shrink-0 text-gray-400"><path fill-rule="evenodd" d="M1 8.74C1 9.99 1.99 11 3.21 11H4v1.306c0 .657.793 1.002 1.278.55l1.977-1.856H12.8c1.22 0 2.2-1.01 2.2-2.26V4.26C15 3.01 14.02 2 12.8 2H3.2C1.98 2 1 3.01 1 4.26v4.48Z" clip-rule="evenodd"/></svg>' +
                                      msgText +
                                    '</span>';
                  } else {
                    payloadHtml = escapeHtml(payload);
                  }

	          var duckLink = '<a href="/status" class="font-medium text-indigo-400 hover:text-indigo-300">' + escapeHtml(value.duck_id) + ' &rarr;</a>';

                  var bodyHtml;
                  if (isMsg) {
                    bodyHtml = '<p class="text-sm text-gray-400 break-words">' + payloadHtml + '</p>' +
                               urgencyRow(payload) +
                               '<p class="mt-0.5 text-xs">' + duckLink + '</p>';
                  } else {
                    bodyHtml = '<p class="text-sm text-gray-400 break-words">' + payloadHtml + ' ' + duckLink + '</p>';
                  }

	          let templateData = '<li><div class="relative pb-8"><div class="relative flex space-x-3"><div><img src="/images/logo.png" alt="Logo" class="size-10"></div><div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5"><div class="min-w-0 flex-1">' + bodyHtml + '</div><div class="whitespace-nowrap text-right text-sm text-gray-400 shrink-0"><time datetime="2020-09-22">' + time24h + '</time></div></div></div></div></li>';
	          template.push(templateData);
	  })

          $('div.flow-root ul li').remove();
          $('div.flow-root ul').html(template.join(""));

          let feed = JSON.stringify(data.data);
          localStorage.setItem('feed', feed);

	  $('div dd#total-messages').html(data.totalCount);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error fetching data: " + textStatus, errorThrown);
        }
      })
    }

    // Poll every 3000 milliseconds (3 seconds)
    setInterval(pollData, 5000);

    // Initial call to load data when the page loads
    pollData();

    // Status page: poll /status/history and refresh each duck's message box (newest first)
    function formatHistoryMessage(msg) {
      var payload  = msg.payload || '';
      var isSos    = /\bSOS\b/i.test(payload);
      var isDevice = /\bSRC:DEVICE\b/i.test(payload);
      var isMsg    = /^MSG\b/i.test(payload);

      // Reuse the shared urgencyBadge() from the outer scope (defaults to Low when absent)
      var badge = urgencyBadge(payload);

      if (isSos && isDevice) {
        return '<div class="flex items-start gap-2 rounded-md bg-red-900/50 px-3 py-2 ring-1 ring-inset ring-red-500/40">' +
                 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="mt-0.5 size-3.5 shrink-0 text-red-400"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>' +
                 '<div>' +
                   '<p class="text-xs font-semibold text-red-400">SOS \u2014 Hardware Button Triggered</p>' +
                   '<p class="text-xs text-red-300/80">Physical SOS button was pressed on the device.</p>' +
                 '</div>' +
               '</div>';
      }

      if (isSos) {
        return '<div class="flex items-start gap-2 rounded-md bg-orange-900/50 px-3 py-2 ring-1 ring-inset ring-orange-500/40">' +
                 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="mt-0.5 size-3.5 shrink-0 text-orange-400"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>' +
                 '<div>' +
                   '<p class="text-xs font-semibold text-orange-400">SOS \u2014 Mobile Phone Triggered</p>' +
                   '<p class="text-xs text-orange-300/80">SOS sent from the mobile app and should include GPS coordinates.</p>' +
                 '</div>' +
               '</div>';
      }

      if (isMsg) {
        var textMatch = payload.match(/TEXT:(.+)$/i);
        var msgText   = textMatch ? escapeHtml(textMatch[1].trim()) : escapeHtml(msg.text || payload);
        return '<div class="rounded-md px-3 py-1.5 text-sm bg-white/10 text-gray-300 break-words">' +
                 msgText +
                 urgencyRow(payload) +
               '</div>';
      }

      var text = escapeHtml(msg.text || msg.payload || '(no content)');
      return '<div class="max-w-full rounded-md px-3 py-1.5 text-sm bg-white/10 text-gray-300 break-words">' +
               text +
             '</div>';
    }

    function pollHistory() {
      $.ajax({
        url: '/status/history',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
          $.each(data, function(duckId, duck) {
            var messages   = duck.messages   || [];
            var lastCoords = duck.last_coords || null;

            // --- Conversation history ---
            var $box = $('[data-history-duck="' + duckId + '"]');
            if ($box.length) {
              if (messages.length === 0) {
                $box.html('<p class="text-center text-xs text-gray-500">No messages yet.</p>');
              } else {
                var html = '';
                $.each(messages, function(i, msg) {
                  var date = new Date(msg.created_at);
                  var timestamp = date.toLocaleString(navigator.language, {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hourCycle: 'h23'
                  });
                  html += '<div class="flex flex-col items-start mb-2">' +
                            formatHistoryMessage(msg) +
                            '<span class="mt-0.5 text-xs text-gray-500">' + timestamp + '</span>' +
                          '</div>';
                });
                $box.html(html);
              }
            }

            // --- Online / Offline badge ---
            var $statusBtn = $('[data-status-duck="' + duckId + '"]');
            if ($statusBtn.length) {
              var isOnline = duck.last_seen && duck.last_seen.is_online;
              $statusBtn
                .text(isOnline ? 'Online' : 'Offline')
                .toggleClass('bg-green-500 hover:bg-green-400 focus-visible:outline-green-500',  isOnline)
                .toggleClass('bg-gray-500 hover:bg-gray-400 focus-visible:outline-gray-500', !isOnline);
            }

            // --- Card timestamp ---
            var $ts = $('[data-timestamp-duck="' + duckId + '"]');
            if ($ts.length && duck.last_seen) {
              $ts.text(duck.last_seen.created_at_for_humans);
            }

            // --- Card payload text ---
            var $payload = $('[data-payload-duck="' + duckId + '"]');
            if ($payload.length && messages.length > 0) {
              var latestText = messages[0].text || messages[0].payload || '';
              $payload.text(latestText);
            }

            // --- Critical MSG urgency notice ---
            var $urgencyNotice = $('[data-urgency-notice-duck="' + duckId + '"]');
            if ($urgencyNotice.length && messages.length > 0) {
              var latestPayload = messages[0].payload || '';
              var isMsg         = /^MSG\b/i.test(latestPayload);
              var urgencyM      = latestPayload.match(/URGENCY:(\d)/i);
              var isCritical    = isMsg && urgencyM && urgencyM[1] === '2';

              if (isCritical) {
                $urgencyNotice.html(
                  '<div class="mt-2 flex items-start gap-2 rounded-md bg-red-950 px-3 py-2 ring-2 ring-inset ring-red-500 animate-pulse">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="mt-0.5 size-4 shrink-0 text-red-400"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>' +
                    '<div>' +
                      '<p class="text-xs font-bold text-red-400 uppercase tracking-wide">Critical \u2014 Immediate Attention Required</p>' +
                      '<p class="text-xs text-red-300/80">This message has been marked as critical urgency and must be attended to immediately.</p>' +
                    '</div>' +
                  '</div>'
                );
              } else {
                $urgencyNotice.empty();
              }
            }

            // --- Last known GPS ---
            var $gps = $('[data-gps-duck="' + duckId + '"]');
            if ($gps.length) {
              if (lastCoords) {
                // Only re-render if the map_url changed (avoids flicker on every poll)
                if ($gps.data('current-map-url') !== lastCoords.map_url) {
                  $gps.data('current-map-url', lastCoords.map_url);
                  var embedUrl = lastCoords.map_url.replace('maps?q=', 'maps?output=embed&q=');
                  $gps.html(
                    '<div class="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 outline outline-1 -outline-offset-1 outline-white/10">' +
                      '<div class="flex items-center gap-2 text-xs text-gray-400">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5 shrink-0 text-green-400"><path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.351 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.246 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" /></svg>' +
                        '<span class="gps-age">Last known location &mdash; ' + escapeHtml(lastCoords.created_at_for_humans) + '</span>' +
                      '</div>' +
                      '<button type="button" data-embed-url="' + escapeHtml(embedUrl) + '" data-duck-id="' + escapeHtml(duckId) + '" ' +
                              'class="gps-toggle-map ml-3 shrink-0 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-500">Open Map</button>' +
                    '</div>'
                  );
                } else {
                  // Just refresh the "X ago" label without re-rendering the whole block
                  $gps.find('.gps-age').text('Last known location \u2014 ' + lastCoords.created_at_for_humans);
                }
              } else {
                $gps.html('<p class="text-xs text-gray-600">No GPS coordinates received yet.</p>');
              }
            }
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error fetching history: ' + textStatus, errorThrown);
        }
      });
    }

    if ($('[data-history-duck]').length) {
      pollHistory();
      setInterval(pollHistory, 3000);
    }

    // Toggle inline map iframe when "Open Map" is clicked
    $(document).on('click', '.gps-toggle-map', function() {
      var embedUrl = $(this).data('embed-url');
      var duckId   = $(this).data('duck-id');
      var $wrapper = $('[data-map-iframe-duck="' + duckId + '"]');
      var $iframe  = $wrapper.find('iframe');

      if ($wrapper.hasClass('hidden')) {
        if ($iframe.attr('src') !== embedUrl) {
          $iframe.attr('src', embedUrl);
        }
        $wrapper.removeClass('hidden');
        $(this).text('Hide Map');
      } else {
        $wrapper.addClass('hidden');
        $(this).text('Open Map');
      }
    });

    $(document).on('submit', '.duck-message-form', function(e) {
        e.preventDefault();

        var $form     = $(this);
        var formData  = $form.serialize();
        var actionUrl = $form.attr('action');

        $.ajax({
            type: 'POST',
            url: actionUrl,
            data: formData,
            success: function(response) {
                $form[0].reset();
            },
            error: function(xhr, status, error) {
                var errors = xhr.responseJSON.errors;
                var errorHtml = '<div><ul>';
                $.each(errors, function(key, value) {
                    errorHtml += '<li>' + value + '</li>';
                });
                errorHtml += '</ul></div>';
                $form.find('#responseMessage').html(errorHtml);
            }
        });
    });
});
