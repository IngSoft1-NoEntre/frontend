import {render, screen, fireEvent } from "@testing-library/react";
import Card from "../components/Card.jsx";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import GameStateProvider from "../context/GameStateProvider";


describe("Card Component Rendering", () => {
    //00
    it("renderiza carta help", () => {
        render(
        <GameStateProvider> 
            <Card cardname="help" faceUp={true}/>
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("help");
        expect(test1).toBeInTheDocument();
    });

    //01
    it("renderiza carta card_back", () => {
        render(
        <GameStateProvider> 
            <Card cardname="card_back" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("card_back");
        expect(test1).toBeInTheDocument();
    });
    
    //02
    it("renderiza carta murder_escapes", () => {
        render(
        <GameStateProvider> 
            <Card cardname="murder_escapes" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("murder_escapes");
        expect(test1).toBeInTheDocument();
    });

    //03
    it("renderiza carta secret_murderer", () => {
        render(
        <GameStateProvider> 
            <Card cardname="secret_murderer" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("secret_murderer");
        expect(test1).toBeInTheDocument();
    });

    //04
    it("renderiza carta secret_accomplice", () => {
        render(
        <GameStateProvider> 
            <Card cardname="secret_accomplice" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("secret_accomplice");
        expect(test1).toBeInTheDocument();
    });

    //05
    it("renderiza carta secret_front", () => {
        render(
        <GameStateProvider> 
            <Card cardname="secret_front" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("secret_front");
        expect(test1).toBeInTheDocument();
    });

    //06
    it("renderiza carta secret_back", () => {
        render(
        <GameStateProvider> 
            <Card cardname="secret_back" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("secret_back");
        expect(test1).toBeInTheDocument();
    });

    //07
    it("renderiza carta detective_poirot", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_poirot" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_poirot");
        expect(test1).toBeInTheDocument();
    });

    //08
    it("renderiza carta detective_marple", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_marple" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_marple");
        expect(test1).toBeInTheDocument();
    });

    //09
    it("renderiza carta detective_satterthwaite", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_satterthwaite" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_satterthwaite");
        expect(test1).toBeInTheDocument();
    });

    //10
    it("renderiza carta detective_pyne", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_pyne" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_pyne");
        expect(test1).toBeInTheDocument();
    });

    //11
    it("renderiza carta detective_brent", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_brent" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_brent");
        expect(test1).toBeInTheDocument();
    });

    //12
    it("renderiza carta detective_tommyberesford", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_tommyberesford" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_tommyberesford");
        expect(test1).toBeInTheDocument();
    });

    //13
    it("renderiza carta detective_tuppenceberesford", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_tuppenceberesford" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_tuppenceberesford");
        expect(test1).toBeInTheDocument();
    });

    //14
    it("renderiza carta detective_quin", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_quin" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_quin");
        expect(test1).toBeInTheDocument();
    });

    //15
    it("renderiza carta detective_oliver", () => {
        render(
        <GameStateProvider> 
            <Card cardname="detective_oliver" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("detective_oliver");
        expect(test1).toBeInTheDocument();
    });

    //16
    it("renderiza carta Instant_notsofast", () => {
        render(
        <GameStateProvider> 
            <Card cardname="Instant_notsofast" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("Instant_notsofast");
        expect(test1).toBeInTheDocument();
    });

    //17
    it("renderiza carta event_cardsonthetable", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_cardsonthetable" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_cardsonthetable");
        expect(test1).toBeInTheDocument();
    });

    //18
    it("renderiza carta event_anothervictim", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_anothervictim" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_anothervictim");
        expect(test1).toBeInTheDocument();
    });

    //19
    it("renderiza carta event_deadcardfolly", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_deadcardfolly" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_deadcardfolly");
        expect(test1).toBeInTheDocument();
    });

    //20
    it("renderiza carta event_lookashes", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_lookashes" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_lookashes");
        expect(test1).toBeInTheDocument();
    });

    //21
    it("renderiza carta event_cardtrade", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_cardtrade" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_cardtrade");
        expect(test1).toBeInTheDocument();
    });

    //22
    it("renderiza carta event_onemore", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_onemore" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_onemore");
        expect(test1).toBeInTheDocument();
    });

    //23
    it("renderiza carta event_delayescape", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_delayescape" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_delayescape");
        expect(test1).toBeInTheDocument();
    });

    //24
    it("renderiza carta event_earlytrain", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_earlytrain" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_earlytrain");
        expect(test1).toBeInTheDocument();
    });

    //25
    it("renderiza carta event_pointsuspicions", () => {
        render(
        <GameStateProvider> 
            <Card cardname="event_pointsuspicions" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("event_pointsuspicions");
        expect(test1).toBeInTheDocument();
    });

    //26
    it("renderiza carta devious_blackmailed", () => {
        render(
        <GameStateProvider> 
            <Card cardname="devious_blackmailed" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("devious_blackmailed");
        expect(test1).toBeInTheDocument();
    });

    //27
    it("renderiza carta devious_fauxpas", () => {
        render(
        <GameStateProvider> 
            <Card cardname="devious_fauxpas" faceUp={true} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("devious_fauxpas");
        expect(test1).toBeInTheDocument();
    });

    //28 boca abajo
    it("renderiza una carta cualquiera pero boca abajo", () => {
        render(
        <GameStateProvider> 
            <Card cardname="murderer_escapes" faceUp={false} />
        </GameStateProvider>
        );
        const test1 = screen.getByAltText("card_back");
        expect(test1).toBeInTheDocument();
    });

    //29 aplicar hover
    it("aplica la clase 'cardframe--hover' al poner el mouse", () => {
        render(
        <GameStateProvider> 
            <Card cardname="help" faceUp={true} isSelectable={true} isSelectad={false}/>
        </GameStateProvider>
        );
        // el div contenedor que recibe las clases dinamicas
        const cardFrame = screen.getByAltText("help").closest("div");

        // Simula la entrada del mouse
        fireEvent.mouseEnter(cardFrame);

        // se aplico hover
        expect(cardFrame).toHaveClass("cardframe--hover");
    });

    //30 sacar hover
    it("remueve la clase 'cardframe--hover' al sacar el mouse", () => {
        render(
         <GameStateProvider> 
           <Card cardname="help" faceUp={true} isSelectable={true} isSelectad={false}/>
         </GameStateProvider>
        );
        
        const cardFrame = screen.getByAltText("help").closest("div");

        // simula la entrada del mouse para aplicar la clase
        fireEvent.mouseEnter(cardFrame);
        expect(cardFrame).toHaveClass("cardframe--hover");

        // simula la salida del mouse
        fireEvent.mouseLeave(cardFrame);

        // afirma que la clase de hover se elimino
        expect(cardFrame).not.toHaveClass("cardframe--hover");
        expect(cardFrame).toHaveClass("cardframe");
    });



    // 31 Aplica zoom
    it("aplica la clase 'cardframe--zoom' al presionar Ctrl y estar enfocado", () => {
        render(
          <GameStateProvider> 
            <Card cardname="help" faceUp={true} isSelectable={true} isSelectad={false}/>
          </GameStateProvider>
        );
        
        const cardFrame = screen.getByAltText("help").closest("div");

        fireEvent.mouseEnter(cardFrame);
        expect(cardFrame).toHaveFocus();

        fireEvent.keyDown(cardFrame, { key: 'Control', ctrlKey: true });
        expect(cardFrame).toHaveClass("cardframe--zoom");
        expect(cardFrame).not.toHaveClass("cardframe--hover");
    });

    //32 Quita zoom
    it("remueve la clase 'cardframe--zoom' al soltar Ctrl", () => {
        render(
          <GameStateProvider> 
            <Card cardname="help" faceUp={true} isSelectable={true} isSelectad={false}/>
          </GameStateProvider>
        );
        
        const cardFrame = screen.getByAltText("help").closest("div");

        // simular entrada del mouse y apretar ctrl
        fireEvent.mouseEnter(cardFrame);
        fireEvent.keyDown(cardFrame, { key: 'Control', ctrlKey: true });
        expect(cardFrame).toHaveClass("cardframe--zoom");

        // simular soltar la tecla
        fireEvent.keyUp(cardFrame, { key: 'Control', ctrlKey: false });
        expect(cardFrame).not.toHaveClass("cardframe--zoom");
    });

    // 33 salir del zoom, incluso si ctrl esta presionado
    it("remueve la clase 'cardframe--zoom' al salir el mouse", () => {
        render(
          <GameStateProvider> 
            <Card cardname="help" faceUp={true} isSelectable={true} isSelectad={false}/>
          </GameStateProvider>
        );
        
        const cardFrame = screen.getByAltText("help").closest("div");

        // simular entrar mouse y apretal ctrl
        fireEvent.mouseEnter(cardFrame);
        fireEvent.keyDown(cardFrame, { key: 'Control', ctrlKey: true });
        expect(cardFrame).toHaveClass("cardframe--zoom");

        // simular salida del mouse, lo que aplica setSize("small")
        fireEvent.mouseLeave(cardFrame);
        expect(cardFrame).not.toHaveClass("cardframe--zoom");
        expect(cardFrame).not.toHaveFocus();
    });

})