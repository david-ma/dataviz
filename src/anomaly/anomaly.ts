// import $ = require("jquery");
declare var $: any;

var stuff = []



function Variant ( data ) {
    try {
//		this.lol = data.;
//        {
//            variant: v.variant,
//                hgvsGVariant: v.hgvsGVariant,
//            chr: v.vcf.variantCall.chromosome
//        }

        this.variant = data.variant;
        this.hgvsGVariant = data.hgvsGVariant;
        this.chr = data.vcf.variantCall.chromosome;
        this.gene = data.sourceResults.Mutalyzer.gene;
        this.hgvsC = data.sourceResults.Mutalyzer.hgvsC;
        this.hgvsG = data.sourceResults.Mutalyzer.hgvsG;
        this.hgvsP = data.sourceResults.Mutalyzer.hgvsP;
        this.refSeq = data.sourceResults.Mutalyzer.refSeq;
        this.assembly = data.sourceResults.Mutalyzer.assembly;

        this.varDepth = data.domainModel.derived.varDepth;
        this.varFreq = data.domainModel.derived.varFreq;
        this.varcaller = data.domainModel.derived.varcaller;


    } catch ( e ) {
        console.error(e);
        console.log(data);
    }
}

var variants = [];
const columnNames = ['variant', 'hgvsGVariant', 'chr', 'gene', 'hgvsC', 'hgvsG', 'hgvsP', 'refSeq', 'assembly', 'varDepth', 'varFreq', 'varcaller'];
//const columns = columnNames.map( function(d){return { data: d, name: d, title: d}});

const columns = columnNames.map( d => ({ data: d, name: d, title: d}));


$.ajax("/08007755.json", {
    success: function(d){
        console.log(d);
        stuff = d;

        Object.keys(d.okResults).forEach(function(hgvsg){
            try {
                const v = new Variant(d.okResults[hgvsg]);
                variants.push(v);
            } catch (e) {
                console.error(e);
            }
        });

        $("#myTable").DataTable({
            data: variants,
            columns: columns
        })

    }
});





