var game = {
    feedstock: 0n,
    mutagen: 0n,

    spawncost: 0n,
    spawncount: 0n,
    spawnsizecounter: 0n,
    spawnsizemin: 1n,
    spawnsizemax: 1n,
    autospawn: false,
    
    puppetcount: 0n,
    puppetmass: 0n,

    manamax: 0n,
    manacurrent: 0n,

    magehandcost: 6n,
    magehandcostbase: 14n,
    magehanddurationbase: 120n,
    magehanddurationcurrent: 0n,
    magehandauto: false,

    healingcost: 6n,
    healingcostbase: 74n,
    healingdurationbase: 120n,
    healingdurationcurrent: 0n,
    healingauto: 0n,

    nummanipulators: 0n,
    manipulators: false,
    manipulatorspecs: false,
    manipulatorlaborers: 0n,
    manipulatorbulwarks: 0n,
    manipulatorsmiths: 0n,
    manipulatorefficacy: 1n,
    manipulatorefficacycost: 1000n,

    numtricksters: 0n,
    tricksters: false,
    trickstermaxmana: 20n,
    trickstermaxmanacost: 5000n,
    trickstermanaregen: 1n,
    trickstermanaregencost: 7500n,

    numdeltas: 0n,
    deltas: false,

    numreconcilants: 0n,
    reconcilants: false,
    reconcilantspawncap: 3n,
    reconcilantspawncapcost: 12500n,

    numimps: 0n,

    numpustules: 0n,
    pustules: false,

    numhowitzers: 0n,
    howitzers: false,

    numheralds: 0n,
    heralds: false,
}

function toggleAutoSpawn() {
    if (game.autospawn == true) {
        game.autospawn = false
        document.getElementById("togglespawn").innerHTML = "Toggle Auto-Spawn (Currently off)"
    } else if (game.autospawn == false) {
        game.autospawn = true
        document.getElementById("togglespawn").innerHTML = "Toggle Auto-Spawn (Currently on)"
    }
}

function spawnPuppet() {
    game.puppetcount = game.nummanipulators + game.numtricksters + game.numdeltas + game.numreconcilants + game.numhowitzers
    game.puppetmass = game.nummanipulators + game.numtricksters + game.numdeltas + (2n * (game.numreconcilants + game.numhowitzers))

    if (game.feedstock > game.spawncost) {
        game.feedstock -= game.spawncost
        game.spawncount += 1n
        
        for (i = 0; i < game.numreconcilants; i++) {
            var reconcilantsubpuppetcount = game.numimps + game.numpustules
            var reconcilantsubpuppetmass = game.numimps + (2n * game.numpustules)
            var reconcilantspawnchance = 0n
            if (reconcilantsubpuppetmass == 0n || (game.numreconcilants > reconcilantsubpuppetcount)) {
                reconcilantspawnchance = 100n
            } else {
                // Trying to properly cap subpuppets to avoid situations where you have thousands of subpuppets from a couple dozen Reconcilants.
                if (reconcilantsubpuppetmass >= (game.numreconcilants * game.reconcilantspawncap)) {
                    reconcilantspawnchance = 0n
                } else {
                    reconcilantspawnchance = 75n
                }
            }

            if ((Math.random() * 100) <= reconcilantspawnchance) {
                var subpuppettype = Math.ceil(Math.random() * 100)
                switch (true) {
                    case ((subpuppettype > 70) && (((game.numreconcilants * game.reconcilantspawncap) - reconcilantsubpuppetmass) >= 2 ) && game.pustules):
                        game.numpustules += 1n;
                    break;
                    default:
                        game.numimps += 1n;
                }
            }
            
        }

        // Howitzers get 1 Herald each, with no increase to cap. To compensate, each Herald is quite powerful, multiplying the production boost by 1.
        // Basically, when Heralds = Howitzers, Howitzers have their effect squared.
        if (game.heralds) {
            for (i = 0; i < game.numhowitzers; i++) {
                if ((game.numheralds < game.numhowitzers) && ((Math.random() * 100) > 50)) {
                    game.numheralds += 1n
                }
            }
        }

        var batchvariance = 1n + (game.spawnsizemax - game.spawnsizemin)
        var batchsize = (BigInt(Math.floor(Math.random() * 1000)) * batchvariance / 1000n) + game.spawnsizemin

        for (i = 0; i < batchsize; i++) {
            // If puppet quantities are too different from a standard expected deviation, prioritize getting them to certain threshholds.
            // Rarer puppets have higher priority in this system (higher in the switch = higher priority) so players don't get screwed.
            // It's not foolproof. There's still some chance to be random anyways.
            var commonalitybalance = true
            if ((Math.random() * 100) >= 50) {
                commonalitybalance = false
            }
            if (commonalitybalance) {
                var weightpool = 0n
                if (game.manipulators) {
                    weightpool += 30n
                }
                if (game.tricksters) {
                    weightpool += 28n
                }
                if (game.deltas) {
                    weightpool += 20n
                }
                if (game.reconcilants) {
                    weightpool += 14n
                }
                if (game.howitzers) {
                    weightpool += 16n
                }
                switch (true) {
                    case ((game.numreconcilants < (game.puppetcount * 14n / weightpool)) && game.reconcilants):
                        game.numreconcilants += 1n
                        //console.log((game.puppetcount * 14n / weightpool) + "Rec")
                    break;
                    case ((game.numhowitzers < (game.puppetcount * 16n / weightpool)) && game.howitzers):
                        game.numhowitzers += 1n
                        //console.log((game.puppetcount * 16n / weightpool) + "How")
                    break;
                    case ((game.numdeltas < (game.puppetcount * 20n / weightpool)) && game.deltas):
                        game.numdeltas += 1n
                        //console.log((game.puppetcount * 20n / weightpool) + "Del")
                    break;
                    case ((game.numtricksters < (game.puppetcount * 28n / weightpool)) && game.tricksters):
                        game.numtricksters += 1n
                        //console.log((game.puppetcount * 28n / weightpool) + "Tri")
                    break;
                    case (game.nummanipulators < ((game.puppetcount * 30n / weightpool)) && game.manipulators):
                        game.nummanipulators += 1n
                        //console.log((game.puppetcount * 30n / weightpool) + "Man")
                    break;
                    default:
                        commonalitybalance = false
                }
            }

            if (commonalitybalance == false) {
                RandomPuppet()
            }
        }
    }
}

function RandomPuppet() {
    var puppettype = Math.ceil(Math.random() * 1380)

    //Note that switch-case is destructive.
    // That is, commonality of any given puppet ranges from its threshhold to that of the puppet above it (for example, Tricksters are given on anywhere from 100 to 56).
    switch (true) {
        case ((puppettype > 1240) && (puppettype <= 1380) && game.howitzers):
            game.numhowitzers += 1n;
        break;
        case ((puppettype > 1080) && (puppettype <= 1240) && game.reconcilants):
            game.numreconcilants += 1n;
        break;
        case ((puppettype > 880) && (puppettype <= 1080) && game.deltas):
            game.numdeltas += 1n;
        case ((puppettype > 600) && (puppettype <= 880) && game.tricksters):
            game.numtricksters += 1n;
        break;
        case ((puppettype <= 600) && game.manipulators):
            game.nummanipulators += 1n;
        break;
        case ((puppettype <= 300) && game.manipulators):
            game.nummanipulators += 1n;
        break;
        default:
            if (game.manipulators) {
                RandomPuppet()
            } else {
                game.feedstock += game.spawncost
            }
    }
}

function CastSpell() {
    var spelltype = arguments[0]

    switch (spelltype) {
        case 1:
            game.magehandcost = (game.magehandcostbase + (game.magehanddurationcurrent / 60n)) * (3n ** (game.magehanddurationcurrent / 60n))
            if (game.manacurrent >= game.magehandcost) {
                game.magehanddurationcurrent += game.magehanddurationbase
                game.manacurrent -= game.magehandcost
            }
        break;
        case 2:
            game.healingcost = (game.healingcostbase + (game.healingdurationcurrent / 60n)) * (3n ** (game.healingdurationcurrent / 60n))
            if (game.manacurrent >= game.healingcost) {
                game.healingdurationcurrent += game.healingdurationbase
                game.manacurrent -= game.healingcost
            }
        break;
    }
}

function Unlock() {
    var unlockType = arguments[0]
    var unlockCost = BigInt(arguments[1])

    if (game.mutagen >= unlockCost) {
        game.mutagen -= unlockCost
        switch (unlockType) {
            case 0:
                if (game.spawnsizemax < 9n ) {
                    game.spawnsizemax += 1n
                    game.spawnsizecounter += 1n
                    if ((game.spawnsizemin * 10n) < (game.spawnsizemax * 3n)) {
                        game.spawnsizemin += 1n
                    }
                    var spawnmultcost = 100n * (10n ** game.spawnsizecounter)
                    document.getElementById("spawningmultiplier").innerHTML = '<button class="unlockbutton" onclick="Unlock(0,' + spawnmultcost + ')">Increase Spawn Multiplier (' + MakeReadableNumber(spawnmultcost) + ' Mutagen)</button>'
                } else {
                    game.spawnsizemax += 1n
                    game.spawnsizecounter += 1n
                    if ((game.spawnsizemin * 10n) < (game.spawnsizemax * 3n)) {
                        game.spawnsizemin += 1n
                    }
                    var spawnmultcost = 100n * (10n ** game.spawnsizecounter)
                    document.getElementById("spawningmultiplier").innerHTML = 'Spawn Multiplier (Maximum Reached)'
                }
            break;
            case 100:
                game.manipulators = true
                document.getElementById("manipulatorunlock").innerHTML = "Manipulators (Unlocked)"
                document.getElementById("manipulatorcolumn").style.display = "inline-block"
                document.getElementById("tricksterunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(200,1000)">Tricksters (1000 Mutagen)</button>'
                document.getElementById("reconcilantunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(500,10000)">Reconcilants (10000 Mutagen)</button>'
                document.getElementById("manipulatorspecialization").innerHTML = '<button class="unlockbutton" onclick="Unlock(101,500)">Manipulator Specializations (500 Mutagen)</button>'
                document.getElementById("manipulatorefficacy").innerHTML = 'Increase Manipulator Efficacy (Requires Manipulator Specializations)'
                document.getElementById("spawningmultiplier").innerHTML = '<button class="unlockbutton" onclick="Unlock(0,100)">Increase Spawn Multiplier (100 Mutagen)</button>'
                document.getElementById("pustuleunlock").innerHTML = 'Pustules (Requires Reconcilants)'
                document.getElementById("howitzerunlock").innerHTML = 'Howitzers (Requires Reconcilants)'
                document.getElementById("deltaunlock").innerHTML = 'Deltas (Requires Tricksters)'
                document.getElementById("trickstermanacap").innerHTML = 'Trickster Mana Capacity (Requires Tricksters)'
                document.getElementById("trickstermanaregen").innerHTML = 'Trickster Mana Regeneration (Requires Tricksters)'
                document.getElementById("reconcilantspawncap").innerHTML = 'Reconcilant Spawn Cap (Requires Reconcilants)'
            break;
            case 101:
                if (game.manipulators) {
                    game.manipulatorspecs = true
                    // Update the Manipulator column with the specialization interface.
                    document.getElementById("manipulatorspecials").style.display = "inline-block"

                    document.getElementById("manipulatorspecialization").innerHTML = 'Manipulator Specializations (Unlocked)'
                    document.getElementById("manipulatorefficacy").innerHTML = '<button class="unlockbutton" onclick="Unlock(102,1000)">Increase Manipulator Efficacy (1000 Mutagen)</button>'
                }
            break;
            case 102:
                if (game.manipulatorspecs) {
                    game.manipulatorefficacy += 1n
                    game.manipulatorefficacycost *= 2n
                    document.getElementById("manipulatorefficacy").innerHTML = '<button class="unlockbutton" onclick="Unlock(102,' + game.manipulatorefficacycost + ')">Increase Manipulator Efficacy (' + MakeReadableNumber(game.manipulatorefficacycost) + ' Mutagen)</button>'
                }
            break;
            case 200:
                if (game.manipulators) {
                    game.tricksters = true
                    document.getElementById("trickstercolumn").style.display = "inline-block"
                    document.getElementById("tricksterunlock").innerHTML = "Tricksters (Unlocked)"
                    document.getElementById("trickstermanacap").innerHTML = '<button class="unlockbutton" onclick="Unlock(201,5000)">Increase Trickster Mana Capacity (5000 Mutagen)</button>'
                    document.getElementById("trickstermanaregen").innerHTML = '<button class="unlockbutton" onclick="Unlock(202,7500)">Increase Trickster Mana Regeneration (7500 Mutagen)</button>'
                    document.getElementById("deltaunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(300,50000)">Deltas (50000 Mutagen)</button>'
                }
            break;
            case 201:
                if (game.tricksters) {
                    game.trickstermaxmana += 10n
                    game.trickstermaxmanacost *= 2n
                    document.getElementById("trickstermanacap").innerHTML = '<button class="unlockbutton" onclick="Unlock(201,' + game.trickstermaxmanacost + ')">Increase Trickster Mana Capacity (' + MakeReadableNumber(game.trickstermaxmanacost) + ' Mutagen)</button>'
                }
            break;
           case 202:
                if (game.tricksters) {
                    game.trickstermanaregen += 1n
                    game.trickstermanaregencost *= 5n
                    document.getElementById("trickstermanaregen").innerHTML = '<button class="unlockbutton" onclick="Unlock(202,' + game.trickstermanaregencost + ')">Increase Trickster Mana Regeneration (' + MakeReadableNumber(game.trickstermanaregencost) + ' Mutagen)</button>'
                }
            break;
            case 300:
                if (game.tricksters) {
                    game.deltas = true
                    document.getElementById("deltacolumn").style.display = "inline-block"
                    document.getElementById("deltaunlock").innerHTML = 'Deltas (Unlocked)'
                }
            break;
            case 500:
                if (game.manipulators) {
                    game.reconcilants = true
                    document.getElementById("reconcilantcolumn").style.display = "inline-block"
                    document.getElementById("reconcilantunlock").innerHTML = "Reconcilants (Unlocked)"
                    document.getElementById("reconcilantspawncap").innerHTML = '<button class="unlockbutton" onclick="Unlock(501,1250)">Increase Reconcilant Spawn Cap (5000 Mutagen)</button>'
                    document.getElementById("pustuleunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(520,25000)">Pustules (25000 Mutagen)</button>'
                    document.getElementById("howitzerunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(600,100000)">Howitzers (100000 Mutagen)</button>'
                    document.getElementById("heraldunlock").innerHTML = "Heralds (Requires Howitzers)"
                }
            break;
            case 501:
                if (game.reconcilants) {
                    game.reconcilantspawncap += 2n
                    game.reconcilantspawncapcost *= 2n
                    document.getElementById("reconcilantspawncap").innerHTML = '<button class="unlockbutton" onclick="Unlock(501,' + game.reconcilantspawncapcost + ')">Increase Reconcilant Spawn Cap (' + MakeReadableNumber(game.reconcilantspawncapcost) + ' Mutagen)</button>'
                }
            break;
            case 520:
                if (game.reconcilants) {
                    game.pustules = true
                    document.getElementById("pustuleunlock").innerHTML = "Pustules (Unlocked)"
                    document.getElementById("pustulecount").style.display = "block"
                    document.getElementById("pustulecount").nextElementSibling.style.display = "block"
                }
            break;
            case 600:
                if (game.reconcilants) {
                    game.howitzers = true
                    document.getElementById("howitzercolumn").style.display = "inline-block"
                    document.getElementById("howitzerunlock").innerHTML = 'Howitzers (Unlocked)'
                    document.getElementById("heraldunlock").innerHTML = '<button class="unlockbutton" onclick="Unlock(610,250000)">Heralds (250000 Mutagen)</button>'
                }
            break;
            case 610:
                if (game.howitzers) {
                    game.heralds = true
                    document.getElementById("heraldunlock").innerHTML = "Heralds (Unlocked)"
                    document.getElementById("heraldcount").style.display = "block"
                    document.getElementById("heraldcount").nextElementSibling.style.display = "block"
                }
            break;
        }
    }
}

function OverallProduction() {
    // Check Manipulators for specializations and calculate distribution based on total Manipulators and each individual job's inputted weight.
    //First, of course, check that specializations are unlocked. If they're not unlocked, all Manipulators are laborers.
    var manipulatorspecweight = 0n;
    var manipulatorlaborersweight = 0n;
    var manipulatorbulwarksweight = 0n;
    var manipulatorsmithsweight = 0n;
    if (game.manipulatorspecs) {
        manipulatorlaborersweight = BigInt(Math.abs(document.getElementById("manipulatorlaborer").value))
        if (0 > document.getElementById("manipulatorlaborer").value) {
            document.getElementById("manipulatorlaborer").value = manipulatorlaborersweight
        }
        manipulatorsmithsweight = BigInt(Math.abs(document.getElementById("manipulatorsmith").value))
        if (0 > document.getElementById("manipulatorsmith").value) {
            document.getElementById("manipulatorsmith").value = manipulatorsmithsweight
        }
        manipulatorbulwarksweight = BigInt(Math.abs(document.getElementById("manipulatorbulwark").value))
        if (0 > document.getElementById("manipulatorbulwark").value) {
            document.getElementById("manipulatorbulwark").value = manipulatorbulwarksweight
        }

        manipulatorspecweight = (manipulatorlaborersweight + manipulatorbulwarksweight + manipulatorsmithsweight)
        if (manipulatorspecweight == 0) {
            manipulatorspecweight = 1n
        }
        game.manipulatorlaborers = (game.nummanipulators * manipulatorlaborersweight) / manipulatorspecweight
        game.manipulatorsmiths = (game.nummanipulators * manipulatorsmithsweight) / manipulatorspecweight
        game.manipulatorbulwarks = (game.nummanipulators * manipulatorbulwarksweight) / manipulatorspecweight

        // Take the remainder and apply it to whatever the player prioritizes (or Laborers if there's no or a mixed preference)
        if ((game.manipulatorbulwarks + game.manipulatorlaborers + game.manipulatorsmiths) < game.nummanipulators) {
            switch (true) {
                case ((manipulatorsmithsweight > manipulatorbulwarksweight) && (manipulatorsmithsweight > manipulatorlaborersweight)):
                    game.manipulatorsmiths += game.nummanipulators - (game.manipulatorbulwarks + game.manipulatorsmiths + game.manipulatorlaborers)
                break;
                case ((manipulatorbulwarksweight > manipulatorsmithsweight) && (manipulatorbulwarksweight > manipulatorlaborersweight)):
                    game.manipulatorbulwarks += game.nummanipulators - (game.manipulatorbulwarks + game.manipulatorsmiths + game.manipulatorlaborers)
                break;
                default:
                    game.manipulatorlaborers += game.nummanipulators - (game.manipulatorbulwarks + game.manipulatorsmiths + game.manipulatorlaborers)
            }
        }
    } else {
        game.manipulatorlaborers = game.nummanipulators
    }

    //Calculate support from Deltas, which is added to every layer (and to mutagen production).
    var deltaSupport = (100n + (5n * game.numdeltas))

    // Calculate Mage Hand's Boost (2^X, where X is minutes of duration).
    var magehandboost = (game.magehanddurationcurrent / 60n)

    //The big meaty block calculating overall production.
    var baseProduction = (3n + (2n * game.manipulatorefficacy * game.manipulatorlaborers) + ((1n + game.numpustules) * game.numimps)) * deltaSupport / 100n
    var landAvailability = 100n + ((10n * game.manipulatorefficacy * game.manipulatorbulwarks) * deltaSupport / 100n)
    var landFertilization = 100n + ((20n * game.numhowitzers * (1n + game.numheralds)) * deltaSupport / 100n)
    var toolProduction = 100n + ((5n * game.manipulatorefficacy * game.manipulatorsmiths) * deltaSupport / 100n)
    var soilEnchantment = 100n + ((10n * game.numtricksters) * deltaSupport / 100n)
    var overallProduction = ((baseProduction * (2n ** magehandboost)) * toolProduction * landFertilization * landAvailability * soilEnchantment) / (100n ** 4n)
    game.feedstock += overallProduction

    // Display for the FSPS counter and breakdown
    document.getElementById("feedstockcalculation").innerHTML = MakeReadableNumber(baseProduction) + " (Base Production)"
    if (magehandboost > 0n) {
        document.getElementById("feedstockcalculation").innerHTML += " * 2^" + MakeReadableNumber(magehandboost) + " (Mage Hands)"
    }
    if (landAvailability > 100n) {
        document.getElementById("feedstockcalculation").innerHTML += " * " + MakeReadableNumber(landAvailability) + "% (Land Availability)"
    }
    if (landFertilization > 100n) {
        document.getElementById("feedstockcalculation").innerHTML += " * " + MakeReadableNumber(landFertilization) + "% (Land Feritilization)"
    }
    if (toolProduction > 100n) {
        document.getElementById("feedstockcalculation").innerHTML += " * " + MakeReadableNumber(toolProduction) + "% (Tool Production)"
    }
    if (soilEnchantment > 100n) {
        document.getElementById("feedstockcalculation").innerHTML += " * " + MakeReadableNumber(soilEnchantment) + "% (Soil Enchantment)"
    }
    document.getElementById("feedstockcalculation").innerHTML += " = " + MakeReadableNumber(overallProduction) + " Feedstock per second"

    game.manamax = 100n + (game.trickstermaxmana * game.numtricksters)
    var manageneration = 5n + ((game.numtricksters * game.trickstermanaregen) / 2n)
    game.manacurrent += manageneration
    if (game.manacurrent >= game.manamax) {
        game.manacurrent = game.manamax
    }

    var mutagenproduction = 10n + ((1n * game.manipulatorefficacy * game.manipulatorsmiths) + (2n * game.numreconcilants) + (2n * game.numheralds) * deltaSupport / 100n )
    game.mutagen += mutagenproduction

    if (game.magehanddurationcurrent > 0) {
        game.magehanddurationcurrent -= 1n
    }
    if (game.healingdurationcurrent > 0) {
        game.healingdurationcurrent -= 1n
    }
}

var mainGameDisplay = window.setInterval(function() {
    OverallProduction()
    if (game.autospawn) {
        spawnPuppet()
    }
    var magehandtarget = BigInt(Math.abs(document.getElementById("magehandtarget").value))
    if (magehandtarget > (game.magehanddurationcurrent / 60n)) {
        CastSpell(1)
    }
    var healingtarget = BigInt(Math.abs(document.getElementById("healingtarget").value))
    if (healingtarget > (game.healingdurationcurrent / 60n)) {
        CastSpell(2)
    }
}, 1000)

function UpdateDisplays() {
    document.getElementById("mainfeedstock").innerHTML = MakeReadableNumber(game.feedstock) + " Feedstock"
    document.getElementById("mainmutagen").innerHTML = MakeReadableNumber(game.mutagen) + " Mutagen"
    game.puppetmass = game.nummanipulators + game.numtricksters + game.numdeltas + (2n * (game.numreconcilants + game.numhowitzers))
    game.spawncost = ((1n + game.puppetmass) * (105n ** game.spawncount) / (100n ** game.spawncount))
    game.spawncost /= (1n + (game.healingdurationcurrent / 60n))
    document.getElementById("mainspawn").innerHTML = "Trigger Impulse (Cost: " + MakeReadableNumber(game.spawncost) + " Feedstock)"

    document.getElementById("manipulatorcount").innerHTML = MakeReadableNumber(game.nummanipulators) + " Manipulators"
    if (game.manipulatorspecs) {
        document.getElementById("manipulatorbulwarkcount").innerHTML = game.manipulatorbulwarks + " Bulwarks performing landclearing, increasing land availability."
        document.getElementById("manipulatorsmithcount").innerHTML = game.manipulatorsmiths + " Smiths producing tools, enhancing workforce effectiveness and contributing to mutation."
        document.getElementById("manipulatorlaborercount").innerHTML = game.manipulatorlaborers + " Laborers doing common work, directly contributing to raw feedstock production."
    }
    document.getElementById("trickstercount").innerHTML = game.numtricksters + " Tricksters"
    document.getElementById("reconcilantcount").innerHTML = game.numreconcilants + " Reconcilants"
    document.getElementById("impcount").innerHTML = game.numimps + " Imps"
    document.getElementById("pustulecount").innerHTML = game.numpustules + " Pustules"
    document.getElementById("deltacount").innerHTML = game.numdeltas + " Deltas"
    document.getElementById("howitzercount").innerHTML = game.numhowitzers + " Howitzers"
    document.getElementById("heraldcount").innerHTML = game.numheralds + " Heralds"

    document.getElementById("manadisplay").innerHTML = game.manacurrent + " / " + game.manamax + " Mana"

    document.getElementById("magehandcast").innerHTML = "Cast Mage Hand (" + (game.magehandcostbase + (game.magehanddurationcurrent / 60n)) * (3n ** (game.magehanddurationcurrent / 60n)) + " Mana)"
    var magehandseconds = (game.magehanddurationcurrent % 60n)
    if (magehandseconds < 10) {
        magehandseconds = "0" + magehandseconds
    }
    document.getElementById("magehandtimer").innerHTML = (game.magehanddurationcurrent / 60n) + ":" + (magehandseconds)

    document.getElementById("healingcast").innerHTML = "Cast Healing Magic (" + (game.healingcostbase + (game.healingdurationcurrent / 60n)) * (3n ** (game.healingdurationcurrent / 60n)) + " Mana)"
    var healingseconds = (game.healingdurationcurrent % 60n)
    if (healingseconds < 10) {
        healingseconds = "0" + healingseconds
    }
    document.getElementById("healingtimer").innerHTML = (game.healingdurationcurrent / 60n) + ":" + (healingseconds)
}

var mainGameDisplay = window.setInterval(function() {
    UpdateDisplays()
}, 20)

function MakeReadableNumber() {
    var starternumber = arguments[0]
    switch (true) {
        case (starternumber >= (10n ** 63n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 60n)) + " Vigintillion"
        break;
        case (starternumber >= (10n ** 60n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 57n)) + " Novemdecillion"
        break;
        case (starternumber >= (10n ** 57n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 54n)) + " Octodecillion"
        break;
        case (starternumber >= (10n ** 54n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 51n)) + " Septendecillion"
        break;
        case (starternumber >= (10n ** 51n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 48n)) + " Sexdecillion"
        break;
        case (starternumber >= (10n ** 48n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 45n)) + " Quindecillion"
        break;
        case (starternumber >= (10n ** 45n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 42n)) + " Quattordecillion"
        break;
        case (starternumber >= (10n ** 42n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 39n)) + " Tredecillion"
        break;
        case (starternumber >= (10n ** 39n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 36n)) + " Duodecillion"
        break;
        case (starternumber >= (10n ** 36n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 33n)) + " Undecillion"
        break;
        case (starternumber >= (10n ** 33n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 30n)) + " Decillion"
        break;
        case (starternumber >= (10n ** 30n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 27n)) + " Nonillion"
        break;
        case (starternumber >= (10n ** 27n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 24n)) + " Octillion"
        break;
        case (starternumber >= (10n ** 24n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 21n)) + " Septillion"
        break;
        case (starternumber >= (10n ** 21n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 18n)) + " Sextillion"
        break;
        case (starternumber >= (10n ** 18n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 15n)) + " Quintillion"
        break;
        case (starternumber >= (10n ** 15n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 12n)) + " Quadrillion"
        break;
        case (starternumber >= (10n ** 12n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 9n)) + " Trillion"
        break;
        case (starternumber >= (10n ** 9n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 6n)) + " Billion"
        break;
        case (starternumber >= (10n ** 6n)):
            starternumber = ArrangeNumber(starternumber / (10n ** 3n)) + " Million"
        break;
    }
    return starternumber
}

function ArrangeNumber() {
    var unbrokennumber = arguments[0].toString()
    var brokennumber = ""
    if (unbrokennumber.length == 4) {
        brokennumber = unbrokennumber.charAt(0) + "." + unbrokennumber.charAt(1) + unbrokennumber.charAt(2) + unbrokennumber.charAt(3)
    } else if (unbrokennumber.length == 5) {
        brokennumber = unbrokennumber.charAt(0) + unbrokennumber.charAt(1) + "." + unbrokennumber.charAt(2) + unbrokennumber.charAt(3) + unbrokennumber.charAt(4)
    } else if (unbrokennumber.length == 6) {
        brokennumber = unbrokennumber.charAt(0) + unbrokennumber.charAt(1) + unbrokennumber.charAt(2) + "." + unbrokennumber.charAt(3) + unbrokennumber.charAt(4) + unbrokennumber.charAt(5)
    }
    return brokennumber
}

function ExportSave() {
    var savedata = "v0.1;"
    savedata += game.feedstock + ";"
    savedata += game.mutagen + ";"

    savedata += game.spawncost + ";"
    savedata += game.spawncount + ";"
    savedata += game.spawnsizecounter + ";"
    savedata += game.spawnsizemin + ";"
    savedata += game.spawnsizemax + ";"
    savedata += game.autospawn + ";"

    savedata += game.puppetcount + ";"
    savedata += game.puppetmass + ";"
    savedata += game.manamax + ";"
    savedata += game.manacurrent + ";"

    savedata += game.magehandcost + ";"
    savedata += game.magehanddurationcurrent + ";"
    
    savedata += game.healingcost + ";"
    savedata += game.healingdurationcurrent + ";"
    
    savedata += game.nummanipulators + ";"
    savedata += game.manipulators + ";"
    savedata += game.manipulatorspecs + ";"
    var laborersave = 0n
    if (document.getElementById("manipulatorlaborer").value != "") {
        laborersave = document.getElementById("manipulatorlaborer").value
    }
    var bulwarksave = 0n
    if (document.getElementById("manipulatorbulwark").value != "") {
        bulwarksave = document.getElementById("manipulatorbulwark").value
    }
    var smithsave = 0n
    if (document.getElementById("manipulatorsmith").value != "") {
        smithsave = document.getElementById("manipulatorsmith").value
    }
    savedata += laborersave + ";"
    savedata += bulwarksave + ";"
    savedata += smithsave + ";"
    savedata += game.manipulatorefficacy + ";"
    savedata += game.manipulatorefficacycost + ";"

    savedata += game.numtricksters + ";"
    savedata += game.tricksters + ";"
    savedata += game.trickstermaxmana + ";"
    savedata += game.trickstermaxmanacost + ";"
    savedata += game.trickstermanaregen + ";"
    savedata += game.trickstermanaregencost + ";"

    savedata += game.numdeltas + ";"
    savedata += game.deltas + ";"

    savedata += game.numreconcilants + ";"
    savedata += game.reconcilants + ";"
    savedata += game.reconcilantspawncap + ";"
    savedata += game.reconcilantspawncapcost + ";"

    savedata += game.numimps + ";"

    savedata += game.numpustules + ";"
    savedata += game.pustules + ";"

    savedata += game.numhowitzers + ";"
    savedata += game.howitzers + ";"

    savedata += game.numheralds + ";"
    savedata += game.heralds + ";"

    document.getElementById("saveexportdump").innerHTML = savedata
}

function ImportSave() {
    var importedsave = document.getElementById("saveimportbox").value.split(";")
    
    // Example save:
    // v0.1;58109;99999999999546197;103;15;2;1;3;false;39;49;400;293;6;0;6;0;12;true;true;12;0;0;3;4000;10;true;30;10000;2;37500;7;true;4;true;5;25000;10;5;true;6;true;6;true;
    // Let's handle the upgrades first, since that's the most complicated part.

    game.feedstock = BigInt(importedsave[1])
    game.mutagen = BigInt(importedsave[2])
    game.spawncost = BigInt(importedsave[3])
    game.spawncount = BigInt(importedsave[4])

    game.manamax = BigInt(importedsave[11])
    game.manacurrent = BigInt(importedsave[12])

    game.magehandcost = BigInt(importedsave[13])
    game.magehanddurationcurrent = BigInt(importedsave[14])

    game.healingcost = BigInt(importedsave[15])
    game.healingdurationcurrent = BigInt(importedsave[16])
    
    if (Boolean(importedsave[18]) == true) {
        Unlock(100, 0n)
    }
    // Because of how the Unlock function works, the Manipulator has to go before the spawn multipliers.
    if (importedsave[5] > 0n) {
        game.spawnsizecounter = BigInt(importedsave[5])
        game.spawnsizemin = BigInt(importedsave[6])
        game.spawnsizemax = BigInt(importedsave[7])
        var spawnmultcost = 100n * (10n ** BigInt(importedsave[5]))
        
        if (game.spawnsizemax < 9n) {
            document.getElementById("spawningmultiplier").innerHTML = '<button class="unlockbutton" onclick="Unlock(0,' + spawnmultcost + ')">Increase Spawn Multiplier (' + MakeReadableNumber(spawnmultcost) + ' Mutagen)</button>'
        } else {
            document.getElementById("spawningmultiplier").innerHTML = 'Spawn Multiplier (Maximum Reached)'
        }
    // MANIPULATORS
    game.nummanipulators = BigInt(importedsave[17])
    }
    if (Boolean(importedsave[19]) == true) {
        Unlock(101, 0n)
        document.getElementById("manipulatorlaborer").value = BigInt(importedsave[20])
        document.getElementById("manipulatorbulwark").value = BigInt(importedsave[21])
        document.getElementById("manipulatorsmith").value = BigInt(importedsave[22])
    }
    if (importedsave[23] > 1n) {
        game.manipulatorefficacy = BigInt(importedsave[23])
        game.manipulatorefficacycost = BigInt(importedsave[24])
        document.getElementById("manipulatorefficacy").innerHTML = '<button class="unlockbutton" onclick="Unlock(102,' + game.manipulatorefficacycost + ')">Increase Manipulator Efficacy (' + MakeReadableNumber(game.manipulatorefficacycost) + ' Mutagen)</button>'
    }
    // TRICKSTERS
    game.numtricksters = BigInt(importedsave[25])
    if (Boolean(importedsave[26]) == true) {
        Unlock(200, 0n)
    }
    if (importedsave[27] > 20n) {
        game.trickstermaxmana = BigInt(importedsave[27])
        game.trickstermaxmanacost = BigInt(importedsave[28])
        document.getElementById("trickstermanacap").innerHTML = '<button class="unlockbutton" onclick="Unlock(201,' + game.trickstermaxmanacost + ')">Increase Trickster Mana Capacity (' + MakeReadableNumber(game.trickstermaxmanacost) + ' Mutagen)</button>'
    }
    if (importedsave[29] > 1n) {
        game.trickstermanaregen = BigInt(importedsave[29])
        game.trickstermanaregencost = BigInt(importedsave[30])
        document.getElementById("trickstermanaregen").innerHTML = '<button class="unlockbutton" onclick="Unlock(202,' + game.trickstermanaregencost + ')">Increase Trickster Mana Regeneration (' + MakeReadableNumber(game.trickstermanaregencost) + ' Mutagen)</button>'
    }
    // DELTAS
    game.numdeltas = BigInt(importedsave[31])
    if (Boolean(importedsave[32]) == true) {
        Unlock(300, 0n)
    }
    // RECONCILANTS
    game.numreconcilants = BigInt(importedsave[33])
    if (Boolean(importedsave[34]) == true) {
        Unlock(500, 0n)
    }
    if (importedsave[35] > 3n) {
        game.reconcilantspawncap = BigInt(importedsave[35])
        game.reconcilantspawncapcost = BigInt(importedsave[36])
        document.getElementById("reconcilantspawncap").innerHTML = '<button class="unlockbutton" onclick="Unlock(501,' + game.reconcilantspawncapcost + ')">Increase Reconcilant Spawn Cap (' + MakeReadableNumber(game.reconcilantspawncapcost) + ' Mutagen)</button>'
    }
    // IMPS
    game.numimps = BigInt(importedsave[37])
    // PUSTULES
    game.numpustules = BigInt(importedsave[38])
    if (Boolean(importedsave[39]) == true) {
        Unlock(520, 0n)
    }
    // HOWITZERS
    game.numhowitzers = BigInt(importedsave[40])
    if (Boolean(importedsave[41]) == true) {
        Unlock(600, 0n)
    }
    // HERALDS
    game.numheralds = BigInt(importedsave[42])
    if (Boolean(importedsave[43]) == true) {
        Unlock(610, 0n)
    }
}