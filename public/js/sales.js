function getXMLHTTP() {
    var xmlhttp = false;

    try {
        xmlhttp = new XMLHttpRequest();
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e1) {
                xmlhttp = false;
            }
        }
    }

    return xmlhttp;
}

function pickAllFromSale(sale) {
    var ajax = getXMLHTTP();

    ajax.onreadystatechange = function() {
        console.log(ajax.readyState);

        if (ajax.readyState == 4 && ajax.status == 200) {
            //  alert(ajax.responseText);

            var json = JSON.parse(ajax.responseText);

            if (json["LinhasDoc"]) {
                json["LinhasDoc"].forEach(function(obj) {
                    addToShoppingCart(json["NumDoc"], obj["CodArtigo"]);

                    var plusId = json["NumDoc"] + '-' + obj["CodArtigo"];

                    try {
                        $("#" + plusId).hide();
                    } catch (e) {

                    }
                });
            }

            $("#pickAll-" + sale).hide();
        }
    };

    ajax.open("GET", "/items/" + sale + "/json", true);
    ajax.send();

    $("#pickAll-" + sale).attr('disabled', 'disabled');
}

function format(d) {
    var ret = '<a href="#" id="pickAll-' + d.NumDoc + '" class="btn btn-xs btn-primary" onclick="pickAllFromSale(' + d.NumDoc + '); return false;" role="button" data-toggle="tooltip" data-placement="bottom" title="Pick All">Pick All</a>' +
              '<br /><table class="table no-footer">' +
                '<thead>' +
                    '<tr>' +
                        '<th>Code</th>' +
                        '<th>Description</th>' +
                        '<th>Shipping Date</th>' +
                        '<th>Unit</th>' +
                        '<th>Quantity</th>' +
                        '<th>Price</th>' +
                        '<th>Discount</th>' +
                        '<th>Total</th>' +
                        '<th>Actions</th>' +
                    '</tr>' +
                '</thead>';

    var rem = d.LinhasDoc.length;

    d.LinhasDoc.forEach(function(linhaDoc) {
        var plusId = d.NumDoc + '-' + linhaDoc.CodArtigo;

        ret += '<tr><td>' + linhaDoc.CodArtigo +
        '</td><td>' + linhaDoc.DescArtigo +
        '</td><td>' + linhaDoc.DataEntrega +
        '</td><td>' + linhaDoc.Unidade +
        '</td><td>' + linhaDoc.Quantidade +
        '</td><td>' + linhaDoc.PrecoUnitario +
        '</td><td>' + linhaDoc.Desconto +
        '</td><td>' + (linhaDoc.PrecoUnitario * linhaDoc.Quantidade - linhaDoc.Desconto) +
        (existsInCartCookie(d.NumDoc, linhaDoc.CodArtigo) ? '</td><td>' : '</td><td><a id="' + plusId + '" name="addButton" href="#" onclick=\'addToShoppingCart(' + d.NumDoc + ', "' + linhaDoc.CodArtigo + '"); $("#' + plusId + '").hide(); return false;\'><span class="glyphicon glyphicon-plus"></span></a>') +
        '</td></tr>';

        if (existsInCartCookie(d.NumDoc, linhaDoc.CodArtigo))
            rem--;
    });

    console.log(rem);

    if (rem == 0) {
        setTimeout(function() {
            $("#pickAll-" + d.NumDoc).hide();

            console.log("Hid element " + "#pickAll-" + d.NumDoc);
        }, 1);
    }

    ret += '</table>';

    return ret;
}

$(document).ready(function() {
    var expl = window.location.href.split("/");

    var ajax = null;

    if (expl[expl.length - 1] == "" || expl[expl.length - 1] == null || expl[expl.length - 1] == "sales") {
        ajax = "/sales/json";
    } else {
        ajax = "/sales/" + expl[expl.length - 1] + "/json";
    }

    console.log(ajax);

    var table = $('#salesTable').DataTable( {
        "paging":   false,
        "ajax": ajax,
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            { "data": "Entidade" },
            { "data": "Data" },
            { "data": "TotalMerc" },
            { "data": "Serie" }
        ],
        "order": [[1, 'asc']],
        oLanguage: {
            sSearch: '<span class="glyphicon glyphicon-search"></span>'
        }
    } );

    // Add event listener for opening and closing details
    $('#salesTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        } else {
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }
    } );
} );